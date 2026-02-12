import express from 'express';
import { createVehicleREG, getDeletedVehicles, getVehicle, getVehicles, createVehicleVIN, updateAVehicle } from '../controllers/vehicleController.js';

const router = express.Router();

// Example with authUser middleware placeholder
// router.get('/', auth, furtherHandlerFunction);

router.post('/createvehiclereg/:id', createVehicleREG);
router.post('/createvehiclevin/:id', createVehicleVIN);
router.put('/updatevehicle/:id', updateAVehicle);
router.delete('/deletedvehicles', getDeletedVehicles);
router.get('/vehicle/:id', getVehicle);
router.get('/listall', getVehicles);

export default router;