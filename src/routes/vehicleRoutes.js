import express from 'express';
import { addNewVehicle, getDeletedVehicles, getVehicle, getVehicles, updateAVehicle, deleteAVehicle, hardDeleteAVehicle, restoreAVehicle } from '../controllers/vehicleController.js';
import { authUser } from '../middleware/authUser.js';

const router = express.Router();

// Create routes for vehicles
router.post('/add', authUser, addNewVehicle);

// Read routes for vehicles
router.get('/deletedvehicles', authUser, getDeletedVehicles);
router.get('/listall', authUser, getVehicles);
router.get('/vehicle/:id', authUser, getVehicle);

// Update route for vehicles
router.put('/updateNote/:id', authUser, updateAVehicle);

// Soft delete, hard delete, and restore routes for vehicles
router.delete('/delete/:id', authUser, deleteAVehicle);
router.put('/delete/:id', authUser, deleteAVehicle);
router.put('/restore/:id', authUser, restoreAVehicle);

export default router;