import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";
import mongoose from "mongoose";

export const authUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = req.cookies.token || (authHeader && authHeader.split(' ')[1]);

        if (!token) {
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        const isBlackListed = await redisClient.get(token);
        if (isBlackListed) {
            res.cookie('token', '');
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Handle migration/fallback for older tokens missing _id
        if (!decoded._id && decoded.email) {
            const user = await redisClient.get(`user:email_to_id:${decoded.email}`);
            if (user) {
                decoded._id = user;
            } else {
                const userDoc = await mongoose.model('user').findOne({ email: decoded.email }).select('_id').lean();
                if (userDoc) {
                    decoded._id = userDoc._id.toString();
                    await redisClient.set(`user:email_to_id:${decoded.email}`, decoded._id, 'EX', 3600);
                }
            }
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.log("Auth middleware error:", error);
        res.status(401).send({ error: 'Unauthorized User' });
    }
}