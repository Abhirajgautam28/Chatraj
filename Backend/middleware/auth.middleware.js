import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";
import mongoose from "mongoose";

const tokenCache = new Map();
const TOKEN_CACHE_TTL = 300000; // 5 minutes

// Simple memory leak protection: periodic cleanup
setInterval(() => {
    const now = Date.now();
    for (const [token, entry] of tokenCache.entries()) {
        if (now - entry.timestamp > TOKEN_CACHE_TTL) {
            tokenCache.delete(token);
        }
    }
}, 60000).unref();

export const authUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = req.cookies.token || (authHeader && authHeader.split(' ')[1]);

        if (!token) {
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        // 1. Check Redis blacklist first for security
        const isBlackListed = await redisClient.get(token);
        if (isBlackListed) {
            tokenCache.delete(token);
            res.cookie('token', '');
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        // 2. Optimization: Local token cache to short-circuit jwt.verify (CPU intensive)
        const now = Date.now();
        const cached = tokenCache.get(token);
        if (cached && (now - cached.timestamp < TOKEN_CACHE_TTL)) {
            req.user = cached.decoded;
            return next();
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

        // 3. Store in local cache (after ensuring _id is present)
        tokenCache.set(token, { decoded, timestamp: now });

        req.user = decoded;
        next();
    } catch (error) {
        console.log("Auth middleware error:", error);
        res.status(401).send({ error: 'Unauthorized User' });
    }
}