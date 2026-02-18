import express from 'express';
import { createUser, deleteUser, loginUser, updateUser, listAllUsers, changeUserPassword, toggleDisable } from '../controllers/userController.js';
import { authUser } from '../middleware/authUser.js';

const router = express.Router();

// Login route for users
router.post('/login', loginUser);

// List all users route
router.get('/listall', authUser, listAllUsers);

// Create, update, and delete routes for users
router.post('/create', authUser, createUser);
router.put('/:id', authUser, updateUser);
router.put('/:id/toggle-disable', authUser, toggleDisable)
router.put('/:id/password', authUser, changeUserPassword);
router.delete('/:id', authUser, deleteUser);

export default router;