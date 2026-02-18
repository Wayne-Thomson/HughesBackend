import User from "../models/User.js";
import dotenv from "dotenv";

// Load environment variables from .env file.
dotenv.config();

/**
 * Common error handler for controller responses.
 * @param {Object} res - Express response object.
 * @param {Error} error - The error object.
 * @param {string} message - Custom error message.
 */
const handleError = (res, error, message) => {
  console.error(message, error?.message);
  res.status(500).json({ message, error: error?.message });
};


export const loginUser = async (req, res) => {
  try {
    //     res.status(200).json({ 
    //   message: 'Login successful', 
    //   user: { 
    //     id: '123456789', 
    //     username: 'testuser',
    //     displayName: 'testuser',
    //     isAdmin: true
    //   } 
    // });
    console.log(req.body);

    const { email, password } = req.body;


    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email, isActive: 'enabled' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password using the model method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return user data (exclude password)
    res.status(200).json({ 
      message: 'Login successful', 
      user: { 
        id: user._id, 
        username: user.username,
        displayName: user.displayName,
        isAdmin: user.isAdmin === true
      } 
    });
  } catch (error) {
    handleError(res, error, 'Error logging in user');
  }
}

export const listAllUsers = async (req, res) => {
  try {
    // Replace with actual logic to fetch users from your database
    const users = await User.find({_id: { $ne: '6994d342ff7104b998eb3a7f' }}, '-password'); // Exclude password field
    console.log('Fetched users:', users);
    res.status(200).json({ message: 'Users fetched successfully', users });
  } catch (error) {
    handleError(res, error, 'Error fetching users');
  }
};

export const createUser = async (req, res) => {
  try {
    const { displayName, username, email, password, isAdmin } = req.body;

    console.log('req.body:', req.body);

    // Validate input
    if (!displayName || !username || !email || !password) {
      return res.status(400).json({ message: 'Display name, username, email, and password are required' });
    }

    // Check if user with the same username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this username already exists' });
    }

    // Create and save the new user
    // Password will be automatically hashed in the pre-save hook
    const user = new User({
      displayName: displayName.toLowerCase(),
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      isAdmin: isAdmin ? true : false,
    });
    await user.save();

    res.status(201).json({ 
      message: 'User created successfully', 
      user: {
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        isAdmin: user.isAdmin === true
      }
    });
  } catch (error) {
    console.log('Error in createUser:', error);
    handleError(res, error, 'Error creating user');
  }
}

export const toggleDisable = async (req, res) => {
  try {
    const { id } = req.params;
    // Validate input
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    // Find user by ID
    const user = await User.findById(id, '-password'); // Exclude password field
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Toggle disabled status
    user.isActive = user.isActive === 'enabled' ? 'disabled' : 'enabled';
    await user.save();
    res.status(200).json({ message: `User ${user.isActive === 'disabled' ? 'disabled' : 'enabled'} successfully`, user: user });
  } catch (error) {
    handleError(res, error, 'Error toggling user status');
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, email, isAdmin } = req.body;
    // Validate input
    if (!id || !displayName || !email) {
      return res.status(400).json({ message: 'User ID, display name, and email are required' });
    }
    // Find user by ID
    const user = await User.findById(id, '-password'); // Exclude password field
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Update user fields
    user.displayName = displayName.toLowerCase();
    user.email = email.toLowerCase();
    user.isAdmin = isAdmin ? true : false;
    await user.save();
    res.status(200).json({ message: 'User updated successfully', user: user });    
  } catch (error) {
    handleError(res, error, 'Error updating user');
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    // Validate input
    if (!id || !password) {
      return res.status(400).json({ message: 'User ID and new password are required' });
    }
    // Find user by ID
    const user = await User.findById(id, '-password'); // Exclude password field
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Update password (will be hashed in pre-save hook)
    user.password = password;
    await user.save();
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.log('Error in changeUserPassword:', error);
    handleError(res, error, 'Error changing user password');
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting user with ID:', id);

    // Validate input
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find user by ID
    const user = await User.findById(id, '-password'); // Exclude password field
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: 'User deleted successfully', userId: id });
  } catch (error) {
    handleError(res, error, 'Error deleting user');
  }
}