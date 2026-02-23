import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables from .env file.
dotenv.config();

export const authUser = (req, res, next) => {
    // authentication middleware to verify JWT token and attach user info to request object
    let token;
    try {
        token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'Internal server error during authentication' });
    }

    // verification logic
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    next();
};