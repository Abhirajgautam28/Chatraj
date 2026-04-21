import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";
import { logger } from "../utils/logger.js";
import { sendError } from "../utils/response.utils.js";

export const authUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = req.cookies.token || (authHeader && authHeader.split(' ')[1]);

        if (!token) {
            return sendError(res, 401, 'Unauthorized User');
        }

        const isBlackListed = await redisClient.get(token);
        if (isBlackListed) {
            res.cookie('token', '');
            return sendError(res, 401, 'Unauthorized User');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        logger.error("Auth middleware error:", error);
        sendError(res, 401, 'Unauthorized User');
    }
}