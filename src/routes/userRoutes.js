import express from 'express';
import { createUser, deleteUser, loginUser, updateUser } from '../controllers/userController.js';
import { authUser } from '../middleware/authUser.js';

const router = express.Router();

// Example with authUser middleware placeholder
// router.get('/', auth, furtherHandlerFunction);

router.get('/login', loginUser);
router.post('/create', authUser, createUser);
router.put('/update', authUser, updateUser);
router.delete('/delete', authUser, deleteUser);


export default router;