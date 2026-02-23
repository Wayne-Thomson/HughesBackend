import mongoose from "mongoose";

// Main VehicleTwo schema
const vehicleTwoSchema = new mongoose.Schema({
    isDeleted: { type: Boolean, required: false, default: false },
    dateDeleted: { type: Date, required: false },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    registration: {type: String, required: true }, 
    vin: { type: String, required: false },
    make: { type: String, required: false },
    model: { type: String, required: false },
    firstUsedDate: { type: String, required: false },
    fuelType: { type: String, required: false },
    primaryColour: { type: String, required: false },
    registrationDate: { type: String, required: false },
    manufactureDate: { type: String, required: false },
    engineSize: { type: String, required: false },
    hasOutstandingRecall: { type: String, required: false },
    motTests: { type: Array, required: false },
    customNotes: { type: String, required: false },
    generation: { type: String, required: false },
    country: { type: String, required: false },
    engineCode: { type: String, required: false },
}, { timestamps: true });

// Export the VehicleTwo model based on the schema.
export default mongoose.model("VehicleTwo", vehicleTwoSchema);
