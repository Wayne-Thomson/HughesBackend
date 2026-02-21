import mongoose from "mongoose";

// Define the VehicleImage schema
// Each vehicle can have a single image associated with it
const vehicleImageSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true,
        unique: true, // Only one image per vehicle
        index: true
    },
        imageData: {
        type: String, // Base64 encoded image data or file path
        required: true
    },
        imageSize: {
        type: Number, // Size in bytes
        required: true
    },
        mimeType: {
        type: String,
        default: 'image/jpeg',
        required: true
    },
        uploadedById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    uploadedByUsername: {
        type: String,
        required: false
    },
}, { timestamps: true });

// Export the VehicleImage model based on the schema
export default mongoose.model("VehicleImage", vehicleImageSchema);
