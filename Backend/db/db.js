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
        console.error('Error connecting to MongoDB:', error.message || error);

        // If the URI used mongodb+srv and the failure looks like a DNS SRV
        // resolution failure, attempt an SRV/TXT resolution using public
        // resolvers (Google/Cloudflare) and retry with a hosts-based URI.
        const mongoUri = process.env.MONGODB_URI || '';
        if (mongoUri.startsWith('mongodb+srv://') && /querySrv|ENOTFOUND|EAI_AGAIN|ECONNREFUSED/.test(String(error))) {
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
                    const customDnsServers = process.env.MONGODB_DNS_SERVERS;
                    if (customDnsServers) {
                        const servers = customDnsServers
                            .split(',')
                            .map(s => s.trim())
                            .filter(Boolean);
                        if (servers.length > 0) {
                            resolver.setServers(servers);
                        }
                    }

                    // Resolve SRV records
                    const records = await resolver.resolveSrv(`_mongodb._tcp.${cluster}`);
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

                    console.log('Retrying MongoDB connection using resolved hosts via public DNS');
                    const conn2 = await mongoose.connect(resolvedUri, {
                        maxPoolSize: 10,
                        serverSelectionTimeoutMS: 10000,
                        socketTimeoutMS: 45000,
                    });
                    console.log(`MongoDB Connected (resolved): ${conn2.connection.host}`);
                    return;
                }
            } catch (fallbackErr) {
                console.error('SRV fallback failed:', fallbackErr);
            }
        }

        setTimeout(connect, 5000);
    }
}

export default connect;