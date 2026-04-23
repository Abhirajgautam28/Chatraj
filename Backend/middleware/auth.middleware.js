import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";
import userModel from "../models/user.model.js";

/**
 * Authentication middleware optimized for performance.
 * Leverages JWT payload for identity context and implements a migration-safe identity mapping.
 */
export const authUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = req.cookies.token || (authHeader && authHeader.split(' ')[1]);

        if (!token) return res.status(401).send({ error: 'Unauthorized User' });

        const isBlackListed = await redisClient.get(token);
        if (isBlackListed) {
            res.cookie('token', '');
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Migration Fallback: If _id is missing (legacy token), fetch it once and keep it in req.user
        if (!decoded._id) {
            const user = await userModel.findOne({ email: decoded.email }).select('_id').lean();
            if (!user) return res.status(401).send({ error: 'User no longer exists' });
            decoded._id = user._id;
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error("[AUTH] Error:", error.message);
        res.status(401).send({ error: 'Unauthorized User' });
    }
}
