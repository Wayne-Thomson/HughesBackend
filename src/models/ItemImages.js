import mongoose from "mongoose";

// Define the ItemImage schema
// Each item can have a single image associated with it
const itemImageSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
        unique: true, // Only one image per item
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

// Export the ItemImage model based on the schema
export default mongoose.model("ItemImage", itemImageSchema);
