import mongoose from "mongoose";

async function connect() {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            retryWrites: true,
            w: "majority",
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            process.exit(0);
        });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
}

export default connect;