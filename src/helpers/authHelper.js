import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * Authenticate user and optionally check for admin privileges.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {boolean} requiresAdmin - Whether admin status is required.
 * @returns {Promise<Object|null>} - Authenticated user object or null if authentication fails.
 */
export const authenticateUser = async (req, res, requiresAdmin = false) => {
  try {
    const { id: logID, username: logUsername, displayName: logDisplayName, isAdmin: logIsAdmin } = req.user;
    
    // Check if required user information is present
    if (!logID || !logUsername || !logDisplayName) {
      res.status(400).json({ message: 'Invalid user information in token' });
      return null;
    }
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(logID)) {
      res.status(400).json({ message: 'Invalid user ID format in token' });
      return null;
    }
    
    // Check if admin is required
    if (requiresAdmin && logIsAdmin !== true) {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
      return null;
    }
    
    // Validate that the authenticated user exists in the database and is active
    const authenticatedUser = await User.findById(logID);
    if (!authenticatedUser || authenticatedUser.isActive !== 'enabled') {
      res.status(401).json({ message: 'Unauthorized: User not found or inactive' });
      return null;
    }
    
    return authenticatedUser;
  } catch (error) {
    console.error('Authentication error:', error?.message);
    res.status(500).json({ message: 'Authentication error', error: error?.message });
    return null;
  }
};
