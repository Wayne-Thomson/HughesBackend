import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables from .env file.
dotenv.config();

export const authUser = (req, res, next) => {
    // Placeholder for user authentication middleware. Likely not to be implemented.
    // Authentication logic would go here, such as verifing a JWT token or checking session data.
    // console.log(req.headers.authorization);
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Extracted token:', token);
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    // Placeholder for token verification logic
    // You would typically verify the token here, e.g., using JWT
    // If the token is invalid, you would return a 401 Unauthorized response
    // Example:
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