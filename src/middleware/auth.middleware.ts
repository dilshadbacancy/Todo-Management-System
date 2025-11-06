import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import { config } from "../config/config";
import { User } from "../model/user.model";


export interface AuthRequest extends Request {
    user?: any
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: "Your are not authorises to access the apis, please authorised and try again."
            })
            return;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Invalid token formate  "
            })
            return;
        }

        const decoded = jwt.verify(token, config.keys.secret_keys.jwt_key!) as any;

        const user = await User.findById(decoded.id).select('-password')

        if (!user) {
            res.status(401).json({
                success: false,
                message: "User no longer exists."
            })
            return;

        }

        req.user = user;
        next();
    } catch (error: any) {
        if (error.name == "JsonWebTokenError") {
            res.status(401).json({
                success: false,
                message: 'Invalid token.',
            });
            return;
        }
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.',
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Authentication failed.',
            error: error.message,
        });
    }
}