import Item from '../models/Item.js';
import ItemImage from '../models/ItemImages.js';
import CompanyStats from '../models/companyStats.js';
import { authenticateUser } from '../helpers/authHelper.js';

export const getItemImage = async (req, res) => {
    try {
        console.log('Fetching item image for item ID:', req.params.itemId);
        const checkAuthenticatedUser = await authenticateUser(req, res);
        if (!checkAuthenticatedUser) return;

        const { itemId } = req.params;
        if (!itemId) {
            return res.status(400).json({ message: 'Item ID is required' });
        }
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        const itemImage = await ItemImage.findOne({ item: itemId });
        if (!itemImage) {
            return res.status(404).json({ message: 'Item image not found' });
        }
        // Return image as data URL for frontend display
        console.log('Found image, mimeType:', itemImage.mimeType, 'imageData length:', itemImage.imageData?.length);
        // Clean the base64 string: remove newlines and trim whitespace
        const cleanBase64 = itemImage.imageData.replace(/\n/g, '').trim();
        const cleanMimeType = itemImage.mimeType.trim();
        const imageUrl = `data:${cleanMimeType};base64,${cleanBase64}`;
        console.log('Sending imageUrl, length:', imageUrl.length, 'format:', imageUrl.substring(0, 50));
        res.status(200).json({ imageUrl });
    } catch (error) {
        console.error('Error fetching item image:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const uploadItemImage = async (req, res) => {
    try {
        const { id, username, isAdmin, companyId } = req.user;

        const checkAuthenticatedUser = await authenticateUser(req, res);
        if (!checkAuthenticatedUser) return;

        const { itemId } = req.params;
        if (!itemId) {
            return res.status(400).json({ message: 'Item ID is required' });
        }

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        
        // Convert image buffer to base64
        console.log('File info:', { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size });
        const imageData = req.file.buffer.toString('base64').replace(/\n/g, '').trim();
        console.log('Base64 converted, length:', imageData.length);
        
        let itemImage = await ItemImage.findOne({ item: itemId });
        if (itemImage) {
            // Replace existing image
            itemImage.imageData = imageData;
            itemImage.mimeType = req.file.mimetype;
            itemImage.imageSize = req.file.size;
            itemImage.uploadedById = id;
            itemImage.uploadedByUsername = username;
            await itemImage.save();
        } else {
            // Create new image record
            itemImage = new ItemImage({ 
                item: itemId, 
                imageData,
                mimeType: req.file.mimetype,
                imageSize: req.file.size,
                uploadedById: id,
                uploadedByUsername: username,
            });
            await itemImage.save();
            // Print the size of the new itemImage object saved to database
            const objectSize = JSON.stringify(itemImage).length;
            const objectSizeKB = (objectSize / 1024).toFixed(2);
            console.log('New ItemImage object saved. Total object size:', objectSizeKB, 'KB');
        }
        const companyStats = await CompanyStats.findOne();
        if (companyStats) {
            companyStats.totalImageStorageBytes += req.file.size;
            await companyStats.save();
        }

        // Return image as data URL
        const cleanMimeType = itemImage.mimeType.trim();
        const imageUrl = `data:${cleanMimeType};base64,${imageData}`;
        console.log('Sending response with imageUrl, length:', imageUrl.length, 'format:', imageUrl.substring(0, 50));
        res.status(200).json({ imageUrl });
    } catch (error) {
        console.error('Error uploading item image:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteItemImage = async (req, res) => {
    try {
        const checkAuthenticatedUser = await authenticateUser(req, res);
        if (!checkAuthenticatedUser) return;

        const { itemId } = req.params;
        if (!itemId) {
            return res.status(400).json({ message: 'Item ID is required' });
        }
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        } 
        const itemImage = await ItemImage.findOne({ item: itemId });
        if (!itemImage) {
            return res.status(404).json({ message: 'Item image not found' });
        }
        await itemImage.deleteOne();

        // Updated the companystats for the reduced total size of images
        const companyStats = await CompanyStats.findOne();
        if (companyStats) {
            companyStats.totalImageStorageBytes = Math.max(0, companyStats.totalImageStorageBytes - itemImage.imageSize);
            await companyStats.save();
        }

        res.status(200).json({ message: 'Item image deleted successfully' });
    } catch (error) {
        console.error('Error deleting item image:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
