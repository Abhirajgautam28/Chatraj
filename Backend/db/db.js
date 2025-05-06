import mongoose from "mongoose";

async function connect() {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            retryWrites: true,
            w: "majority",
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
            // Attempt to reconnect
            setTimeout(connect, 5000);
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            process.exit(0);
        });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        // Don't exit on initial connection failure, try to reconnect
        setTimeout(connect, 5000);
    }
}

export default connect;