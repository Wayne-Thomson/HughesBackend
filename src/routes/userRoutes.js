import express from 'express';
import { createUser, deleteUser, loginUser, updateUser, listAllUsers } from '../controllers/userController.js';
import { authUser } from '../middleware/authUser.js';

const router = express.Router();

// Login route for users
router.get('/login', loginUser);

// List all users route
router.get('/listall', authUser, listAllUsers);

// Create, update, and delete routes for users
router.post('/create', authUser, createUser);
router.put('/:id', authUser, updateUser);
router.delete('/:id', authUser, deleteUser);

export default router;