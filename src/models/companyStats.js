import mongoose from "mongoose";

// Define the CompanyStats schema
const companyStatsSchema = new mongoose.Schema({
    totalVehicles: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    
    // Vehicle tracking with monthly cap
    vehiclesAddedThisMonth: { type: Number, default: 0 },
    monthlyVehicleCapLimit: { type: Number, default: 100 },
    currentMonthYear: { type: String, required: true }, // Format: "YYYY-MM"
    
    // Image storage tracking
    totalImageStorageBytes: { type: Number, default: 0 }, // Total size of all stored images in bytes
    totalImageStorageMB: {
        type: Number,
        default: 0,
        get: function() {
            return (this.totalImageStorageBytes / (1024 * 1024)).toFixed(2);
        }
    }
}, { 
    timestamps: true,
    getters: true // Enable getters for virtual fields
});

// Create the CompanyStats model
const CompanyStats = mongoose.model("CompanyStats", companyStatsSchema);

export default CompanyStats;