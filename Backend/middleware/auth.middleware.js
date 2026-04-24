import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";
import userModel from "../models/user.model.js";

const TOKEN_VERIFICATION_CACHE = new Map();
const CACHE_TTL = 30000;

export const authUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = req.cookies.token || (authHeader && authHeader.split(' ')[1]);

        if (!token) return res.status(401).send({ error: 'Unauthorized User' });

        const cached = TOKEN_VERIFICATION_CACHE.get(token);
        if (cached && Date.now() < cached.expiry) {
            req.user = cached.user;
            return next();
        }

        const isBlackListed = await redisClient.get(token);
        if (isBlackListed) {
            res.cookie('token', '');
            TOKEN_VERIFICATION_CACHE.delete(token);
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded._id) {
            const user = await userModel.findOne({ email: decoded.email }).select('_id').lean();
            if (!user) return res.status(401).send({ error: 'User no longer exists' });
            decoded._id = user._id;
        }

        req.user = decoded;
        TOKEN_VERIFICATION_CACHE.set(token, { user: decoded, expiry: Date.now() + CACHE_TTL });
        if (TOKEN_VERIFICATION_CACHE.size > 2000) TOKEN_VERIFICATION_CACHE.delete(TOKEN_VERIFICATION_CACHE.keys().next().value);

        next();
    } catch (error) {
        res.status(401).send({ error: 'Unauthorized User' });
    }
}
