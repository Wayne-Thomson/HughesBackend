import mongoose from "mongoose";

// Define the Item schema with fields for inventory management
const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    weight: { type: String, required: false },
    estimatedValue: { type: Number, required: false },
    customNotes: { type: String, required: false },
    isDeleted: { type: Boolean, required: false, default: false },
    dateDeleted: { type: Date, required: false },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
}, { timestamps: true });

// Export the Item model based on the schema
export default mongoose.model("Item", itemSchema);
