import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";
import response from '../utils/response.js';

export const authUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = req.cookies.token || (authHeader && authHeader.split(' ')[1]);

        if (!token) {
            return response.error(res, 'Unauthorized User', 401);
        }

        const isBlackListed = await redisClient.get(token);
        if (isBlackListed) {
            res.cookie('token', '');
            return response.error(res, 'Unauthorized User', 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fast profile lookup from cache if available, else use token data
        const cachedProfile = await redisClient.get(`user:profile:${decoded._id || decoded.id}`);
        if (cachedProfile) {
            req.user = JSON.parse(cachedProfile);
        } else {
            req.user = decoded;
        }

        next();
    } catch (error) {
        console.log("Auth middleware error:", error);
        return response.error(res, 'Unauthorized User', 401);
    }
}