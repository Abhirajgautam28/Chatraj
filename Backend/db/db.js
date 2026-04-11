import mongoose from "mongoose";
import dns from 'dns/promises';

async function connect() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        mongoose.set('strictQuery', false);

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            setTimeout(connect, 5000);
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            process.exit(0);
        });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error && error.stack ? error.stack : (error.message || error));

        // Attempt SRV fallback only for mongodb+srv URIs and only when the
        // error indicates a DNS/SRV resolution problem. Be conservative to
        // avoid triggering the fallback for unrelated connection issues.
        const mongoUri = process.env.MONGODB_URI || '';
        const shouldAttemptSrvFallback = (() => {
            if (!mongoUri.startsWith('mongodb+srv://')) return false;
            if (!error) return false;
            const name = String(error.name || '');
            const code = String(error.code || '');
            const msg = String(error.message || error || '');

            // Common DNS/network related error codes/messages
            const dnsErrorCodes = ['ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED'];

            // If Mongoose/Mongo reports a server selection/network error,
            // that's a good indicator the SRV lookup failed.
            if (name === 'MongoServerSelectionError' || name === 'MongoNetworkError') return true;

            // If the message specifically mentions querySrv or DNS errors,
            // consider this DNS-related and attempt the fallback.
            if (/querySrv/i.test(msg)) return true;

            // If the error code or message contains known DNS error codes.
            if (dnsErrorCodes.some(c => code.includes(c) || msg.includes(c))) return true;

            return false;
        })();

        if (shouldAttemptSrvFallback) {
            try {
                const parsedUrl = new URL(mongoUri);
                const authPart = parsedUrl.username
                    ? (parsedUrl.password
                        ? `${parsedUrl.username}:${parsedUrl.password}`
                        : parsedUrl.username)
                    : '';
                const cluster = parsedUrl.host;
                const dbName = parsedUrl.pathname.replace(/^\//, '') || '';
                const originalQuery = parsedUrl.search ? parsedUrl.search.slice(1) : '';

                const resolver = new dns.Resolver();
                // Allow overriding DNS servers via environment variable
                // e.g. MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1
                const customDnsServers = process.env.MONGODB_DNS_SERVERS;
                if (customDnsServers) {
                    const servers = customDnsServers
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean);
                    if (servers.length > 0) resolver.setServers(servers);
                }

                // Resolve SRV records (uses system resolver unless MONGODB_DNS_SERVERS provided)
                let records;
                try {
                    records = await resolver.resolveSrv(`_mongodb._tcp.${cluster}`);
                } catch (rerr) {
                    console.error('SRV resolution failed:', rerr && (rerr.stack || rerr.message || rerr));

                    // If the system resolver refused the connection (common in
                    // restricted CI or locked-down networks), allow a one-time
                    // fallback to well-known public DNS servers in non-production
                    // environments or when explicitly enabled.
                    const isConnRefused = String(rerr.code || '').includes('ECONNREFUSED') || /ECONNREFUSED/i.test(String(rerr.message || rerr));
                    const customDnsProvided = Boolean(process.env.MONGODB_DNS_SERVERS);
                    const allowPublicFallback = !customDnsProvided && (process.env.NODE_ENV !== 'production' || process.env.MONGODB_ALLOW_PUBLIC_DNS_FALLBACK === 'true');

                    if (isConnRefused && allowPublicFallback) {
                        try {
                            resolver.setServers(['8.8.8.8', '1.1.1.1']);
                            console.warn('System DNS resolver refused connection — retrying SRV lookup using public DNS (8.8.8.8,1.1.1.1).');
                            records = await resolver.resolveSrv(`_mongodb._tcp.${cluster}`);
                        } catch (r2err) {
                            console.error('Public DNS fallback SRV resolution failed:', r2err && (r2err.stack || r2err.message || r2err));
                            throw r2err;
                        }
                    } else {
                        throw rerr;
                    }
                }

                const hosts = records.map(r => `${r.name}:${r.port || 27017}`).join(',');

                // Resolve TXT records for default options (replicaSet, tls, etc.)
                let mergedParams = new URLSearchParams(originalQuery);
                try {
                    const txts = await resolver.resolveTxt(cluster);
                    for (const arr of txts) {
                        const txt = arr.join('');
                        txt.split('&').forEach(pair => {
                            const [k, v] = pair.split('=');
                            if (k && v && !mergedParams.has(k)) mergedParams.set(k, v);
                        });
                    }
                } catch (txtErr) {
                    // ignore TXT failures
                }

                // Ensure TLS is enabled for Atlas if not already present
                if (!mergedParams.has('tls') && !mergedParams.has('ssl')) mergedParams.set('tls', 'true');

                const authPrefix = authPart ? `${authPart}@` : '';
                const dbSegment = dbName ? `/${dbName}` : '';
                const resolvedUri = `mongodb://${authPrefix}${hosts}${dbSegment}?${mergedParams.toString()}`;

                console.log('Retrying MongoDB connection using resolved hosts via DNS resolver (custom or system)');
                const conn2 = await mongoose.connect(resolvedUri, {
                    maxPoolSize: 10,
                    serverSelectionTimeoutMS: 10000,
                    socketTimeoutMS: 45000,
                });
                console.log(`MongoDB Connected (resolved): ${conn2.connection.host}`);
                return;
            } catch (fallbackErr) {
                console.error('SRV fallback failed:', fallbackErr && fallbackErr.stack ? fallbackErr.stack : (fallbackErr.message || fallbackErr));
            }
        }

        setTimeout(connect, 5000);
    }
}

export default connect;