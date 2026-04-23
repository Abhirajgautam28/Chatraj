import mongoose from "mongoose";

async function connect() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        mongoose.set('strictQuery', false);

        // Slow Query Monitoring (Dev/Stage)
        if (process.env.NODE_ENV !== 'production') {
            mongoose.set('debug', (collectionName, method, query, doc) => {
                const start = Date.now();
                return (...args) => {
                    const duration = Date.now() - start;
                    if (duration > 100) {
                        console.warn(`[MONGO SLOW QUERY] ${collectionName}.${method} - ${duration}ms`, JSON.stringify(query));
                    }
                };
            });
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 50,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 30000,
            heartbeatFrequencyMS: 10000,
            retryWrites: true
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Reconnecting...');
            setTimeout(connect, 5000);
        });

    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        setTimeout(connect, 5000);
    }
}

export default connect;
