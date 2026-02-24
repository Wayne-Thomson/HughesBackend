import express from 'express';
import multer from 'multer';
import { addNewVehicle, getDeletedVehicles, getVehicle, getVehicles, updateAVehicle, deleteAVehicle, hardDeleteAVehicle, restoreAVehicle, lookupVehicle, getVehiclesHTML, getVehiclesJSON } from '../controllers/vehicleController.js';
import { getVehicleImage, uploadVehicleImage, deleteVehicleImage } from '../controllers/vehicleImagesController.js';
import { authUser } from '../middleware/authUser.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage(); // Store in memory for processing
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept JPEG files
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG files are allowed'), false);
    }
  }
});

// Create routes for vehicles
router.post('/add', authUser, addNewVehicle);
router.get('/lookup', authUser, lookupVehicle);

// Read routes for vehicles
router.get('/deletedvehicles', authUser, getDeletedVehicles);
router.get('/listall', authUser, getVehicles);
router.get('/html', getVehiclesHTML);
router.get('/json', getVehiclesJSON);
router.get('/vehicle/:id', authUser, getVehicle);

// Update route for vehicles
router.put('/updateNote/:id', authUser, updateAVehicle);

// Soft delete, hard delete, and restore routes for vehicles
router.delete('/delete/:id', authUser, deleteAVehicle);
router.put('/delete/:id', authUser, deleteAVehicle);
router.put('/restore/:id', authUser, restoreAVehicle);

// Additional routes for vehicle images
router.post('/image/:vehicleId', authUser, upload.single('image'), uploadVehicleImage);
router.get('/image/:vehicleId', authUser, getVehicleImage);
router.delete('/image/:vehicleId', authUser, deleteVehicleImage);

export default router;