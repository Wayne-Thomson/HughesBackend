import express from 'express';
import { createVehicleREG, getDeletedVehicles, getVehicle, getVehicles, createVehicleVIN, updateAVehicle } from '../controllers/vehicleController.js';

const router = express.Router();

// Example with authUser middleware placeholder
// router.get('/', auth, furtherHandlerFunction);

router.get('/createvehiclereg', createVehicleREG);
router.get('/createvehiclevin', createVehicleVIN);
router.get('/updatevehicle/:id', updateAVehicle);
router.get('/deletedvehicles', getDeletedVehicles);
router.get('/vehicle/:id', getVehicle);
router.get('/listall', getVehicles);

export default router;