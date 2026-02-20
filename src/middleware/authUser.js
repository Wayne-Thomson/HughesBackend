import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables from .env file.
dotenv.config();

export const authUser = (req, res, next) => {
    // authentication middleware to verify JWT token and attach user info to request object
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    // verification logic
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    console.log('User authenticated:', req.user);

    next();
}