import mongoose from "mongoose";

// Define the Vehicle schema.
// Each vehicle has a title and content, both required.
const vehicleSchema = new mongoose.Schema({
    registrationNumber: {type: String, required: true }, 
    vin: { type: String, required: false },
    make: { type: String, required: false },
    model: { type: String, required: false },
    firstUsedDate: { type: String, required: false },
    fuelType: { type: String, required: false },
    primaryColour: { type: String, required: false },
    registrationDate: { type: String, required: false },
    manufactureDate: { type: String, required: false },
    engineSize: { type: String, required: false },
    hasOutstandingRecall: { type: Boolean, required: false },
    motTests: { type: Array, required: false },
    customNotes: { type: String, required: false },
    isDeleted: { type: Boolean, required: false, default: false },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
}, { timestamps: true });

// Export the Vehicle model based on the schema.
export default mongoose.model("Vehicle", vehicleSchema);