import mongoose from "mongoose";
import dns from 'dns/promises';

let mongoRetryCount = 0;

function shouldAttemptSrvFallback(mongoUri, error) {
    if (!mongoUri || !mongoUri.startsWith('mongodb+srv://')) return false;
    if (!error) return false;
    const err = error || {};
    const name = String(err.name || '');
    const code = String(err.code || '');
    const msg = String(err.message || error || '');

    const dnsErrorCodes = ['ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED'];

    if (name === 'MongoServerSelectionError' || name === 'MongoNetworkError') return true;
    if (/querySrv/i.test(msg)) return true;
    if (dnsErrorCodes.some(c => (code && String(code).includes(c)) || (msg && msg.includes(c)))) return true;
    return false;
}

async function resolveSrvWithFallback(resolver, cluster) {
    try {
        return await resolver.resolveSrv(`_mongodb._tcp.${cluster}`);
    } catch (rerr) {
        console.error('SRV resolution failed:', rerr && (rerr.stack || rerr.message || rerr));

        const isConnRefused = String(rerr.code || '').includes('ECONNREFUSED') || /ECONNREFUSED/i.test(String(rerr.message || rerr));
        const customDnsProvided = Boolean(process.env.MONGODB_DNS_SERVERS);
        const allowPublicFallback = !customDnsProvided && (process.env.NODE_ENV !== 'production' || process.env.MONGODB_ALLOW_PUBLIC_DNS_FALLBACK === 'true');

        if (!isConnRefused || !allowPublicFallback) throw rerr;

        resolver.setServers(['8.8.8.8', '1.1.1.1']);
        console.warn('System DNS resolver refused connection — retrying SRV lookup using public DNS (8.8.8.8,1.1.1.1).');
        return await resolver.resolveSrv(`_mongodb._tcp.${cluster}`);
    }
}

async function mergeTxtParams(baseParams, cluster, resolver) {
    const merged = new URLSearchParams(baseParams.toString());
    try {
        const txts = await resolver.resolveTxt(cluster);
        for (const arr of txts) {
            const txt = Array.isArray(arr) ? arr.join('') : String(arr || '');
            txt.split('&').forEach(pair => {
                const [k, v] = pair.split('=');
                if (k && v && !merged.has(k)) merged.set(k, v);
            });
        }
    } catch (e) {
        // ignore TXT failures
    }
    return merged;
}

async function connect() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        mongoose.set('strictQuery', false);

        const conn = await mongoose.connect(uri, {
            maxPoolSize: 50,
            minPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            heartbeatFrequencyMS: 10000,
            waitQueueTimeoutMS: 5000,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            // Use exponential backoff for reconnection
            const backoff = Math.min(30000, 5000 * Math.pow(2, mongoRetryCount));
            mongoRetryCount++;
            setTimeout(connect, backoff);
        });

        // Reset retry count on successful connection
        mongoRetryCount = 0;

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            process.exit(0);
        });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error && error.stack ? error.stack : (error.message || error));

        const mongoUri = process.env.MONGODB_URI || '';
        if (shouldAttemptSrvFallback(mongoUri, error)) {
            try {
                const parsedUrl = new URL(mongoUri);
                const authPart = parsedUrl.username
                    ? (parsedUrl.password
                        ? `${parsedUrl.username}:${parsedUrl.password}`
                        : parsedUrl.username)
                    : '';
                const cluster = parsedUrl.hostname;
                const dbName = parsedUrl.pathname.replace(/^\//, '') || '';
                const originalQuery = parsedUrl.search ? parsedUrl.search.slice(1) : '';

                const resolver = new dns.Resolver();
                const customDnsServers = process.env.MONGODB_DNS_SERVERS;
                if (customDnsServers) {
                    const servers = customDnsServers
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean);
                    if (servers.length > 0) resolver.setServers(servers);
                }

                const records = await resolveSrvWithFallback(resolver, cluster);
                const hosts = records.map(r => `${r.name}:${r.port || 27017}`).join(',');

                let mergedParams = await mergeTxtParams(new URLSearchParams(originalQuery), cluster, resolver);
                if (!mergedParams.has('tls') && !mergedParams.has('ssl')) mergedParams.set('tls', 'true');

                const authPrefix = authPart ? `${authPart}@` : '';
                const dbSegment = dbName ? `/${dbName}` : '';
                const resolvedUri = `mongodb://${authPrefix}${hosts}${dbSegment}?${mergedParams.toString()}`;

                console.log('Retrying MongoDB connection using resolved hosts via DNS resolver (custom or system)');
                const conn2 = await mongoose.connect(resolvedUri, {
                    maxPoolSize: 50,
                    minPoolSize: 10,
                    serverSelectionTimeoutMS: 10000,
                    socketTimeoutMS: 45000,
                    heartbeatFrequencyMS: 10000,
                    waitQueueTimeoutMS: 5000,
                });
                console.log(`MongoDB Connected (resolved): ${conn2.connection.host}`);
                return;
            } catch (fallbackErr) {
                console.error('SRV fallback failed:', fallbackErr && (fallbackErr.stack || fallbackErr.message || fallbackErr));
            }
        }

        setTimeout(connect, 5000);
    }
}

export default connect;