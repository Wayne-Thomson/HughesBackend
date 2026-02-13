import express from 'express';
import { createVehicleREG, getDeletedVehicles, getVehicle, getVehicles, createVehicleVIN, updateAVehicle, deleteAVehicle, hardDeleteAVehicle, restoreAVehicle } from '../controllers/vehicleController.js';
import { authUser } from '../middleware/authUser.js';

const router = express.Router();

// Example with authUser middleware placeholder
// router.get('/', auth, furtherHandlerFunction);

router.post('/createvehiclereg/:id', authUser, createVehicleREG);
router.post('/createvehiclevin/:id', authUser, createVehicleVIN);
router.put('/updatevehicle/:id', authUser, updateAVehicle);
router.delete('/deletedvehicles', authUser, getDeletedVehicles);
router.get('/vehicle/:id', authUser, getVehicle);
router.get('/listall', authUser, getVehicles);
router.delete('/delete/:id', authUser, deleteAVehicle);
router.delete('/harddelete/:id', authUser, hardDeleteAVehicle);
router.put('/restore/:id', authUser, restoreAVehicle);

export default router;