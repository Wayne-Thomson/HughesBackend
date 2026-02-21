import Vehicle from '../models/VehicleTwo.js';
import VehicleImage from '../models/vehicleImages.js';
import CompanyStats from '../models/companyStats.js';
import { authenticateUser } from '../helpers/authHelper.js';

export const getVehicleImage = async (req, res) => {
    try {
        console.log('Fetching vehicle image for vehicle ID:', req.params.vehicleId);
        const checkAuthenticatedUser = await authenticateUser(req, res);
        if (!checkAuthenticatedUser) return;

        const { vehicleId } = req.params;
        if (!vehicleId) {
            return res.status(400).json({ message: 'Vehicle ID is required' });
        }
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        const vehicleImage = await VehicleImage.findOne({ vehicle: vehicleId });
        if (!vehicleImage) {
            return res.status(404).json({ message: 'Vehicle image not found' });
        }
        // Return image as data URL for frontend display
        console.log('Found image, mimeType:', vehicleImage.mimeType, 'imageData length:', vehicleImage.imageData?.length);
        // Clean the base64 string: remove newlines and trim whitespace
        const cleanBase64 = vehicleImage.imageData.replace(/\n/g, '').trim();
        const cleanMimeType = vehicleImage.mimeType.trim();
        const imageUrl = `data:${cleanMimeType};base64,${cleanBase64}`;
        console.log('Sending imageUrl, length:', imageUrl.length, 'format:', imageUrl.substring(0, 50));
        res.status(200).json({ imageUrl });
    } catch (error) {
        console.error('Error fetching vehicle image:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const uploadVehicleImage = async (req, res) => {
    try {
        const { id, username, isAdmin, companyId }  = req.user;

        const checkAuthenticatedUser = await authenticateUser(req, res);
        if (!checkAuthenticatedUser) return;

        const { vehicleId } = req.params;
        if (!vehicleId) {
            return res.status(400).json({ message: 'Vehicle ID is required' });
        }

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        
        // Convert image buffer to base64
        console.log('File info:', { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size });
        const imageData = req.file.buffer.toString('base64').replace(/\n/g, '').trim();
        console.log('Base64 converted, length:', imageData.length);
        
        let vehicleImage = await VehicleImage.findOne({ vehicle: vehicleId });
        if (vehicleImage) {
            // Replace existing image
            vehicleImage.imageData = imageData;
            vehicleImage.mimeType = req.file.mimetype;
            vehicleImage.imageSize = req.file.size;
            vehicleImage.uploadedById = id;
            vehicleImage.uploadedByUsername = username;
            await vehicleImage.save();
        } else {
            // Create new image record
            vehicleImage = new VehicleImage({ 
                vehicle: vehicleId, 
                imageData,
                mimeType: req.file.mimetype,
                imageSize: req.file.size,
                uploadedById: id,
                uploadedByUsername: username,
            });
            await vehicleImage.save();
            // Print the size of the new vehicleImage object saved to database
            const objectSize = JSON.stringify(vehicleImage).length;
            const objectSizeKB = (objectSize / 1024).toFixed(2);
            console.log('New VehicleImage object saved. Total object size:', objectSizeKB, 'KB');
        }
        const companyStats = await CompanyStats.findOne();
        if (companyStats) {
            companyStats.totalImageStorageBytes += req.file.size;
            await companyStats.save();
        }

        // Return image as data URL
        const cleanMimeType = vehicleImage.mimeType.trim();
        const imageUrl = `data:${cleanMimeType};base64,${imageData}`;
        console.log('Sending response with imageUrl, length:', imageUrl.length, 'format:', imageUrl.substring(0, 50));
        res.status(200).json({ imageUrl });
    } catch (error) {
        console.error('Error uploading vehicle image:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteVehicleImage = async (req, res) => {
    try {
        const checkAuthenticatedUser = await authenticateUser(req, res);
        if (!checkAuthenticatedUser) return;

        const { vehicleId } = req.params;
        if (!vehicleId) {
            return res.status(400).json({ message: 'Vehicle ID is required' });
        }
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        } 
        const vehicleImage = await VehicleImage.findOne({ vehicle: vehicleId });
        if (!vehicleImage) {
            return res.status(404).json({ message: 'Vehicle image not found' });
        }
        await vehicleImage.deleteOne();

        // Updated the companystats for the reduced total size of images
        const companyStats = await CompanyStats.findOne();
        if (companyStats) {
            companyStats.totalImageStorageBytes = Math.max(0, companyStats.totalImageStorageBytes - vehicleImage.imageSize);
            await companyStats.save();
        }

        res.status(200).json({ message: 'Vehicle image deleted successfully' });
        } catch (error) {
            console.error('Error deleting vehicle image:', error);
        res.status(500).json({ message: 'Server error', error });
    }
}