import express from 'express';
import multer from 'multer';
import { addNewItem, getDeletedItems, getItem, getItems, updateAnItem, deleteAnItem, restoreAnItem } from '../controllers/itemsController.js';
import { getItemImage, uploadItemImage, deleteItemImage } from '../controllers/itemsImagesController.js';
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

// Create routes for items
router.post('/add', authUser, addNewItem);

// Read routes for items
router.get('/deleteditems', authUser, getDeletedItems);
router.get('/listall', authUser, getItems);
router.get('/item/:id', authUser, getItem);

// Update route for items
router.put('/updateNote/:id', authUser, updateAnItem);

// Soft delete and restore routes for items
router.delete('/delete/:id', authUser, deleteAnItem);
router.put('/delete/:id', authUser, deleteAnItem);
router.put('/restore/:id', authUser, restoreAnItem);

// Additional routes for item images
router.post('/image/:itemId', authUser, upload.single('image'), uploadItemImage);
router.get('/image/:itemId', authUser, getItemImage);
router.delete('/image/:itemId', authUser, deleteItemImage);

export default router;
