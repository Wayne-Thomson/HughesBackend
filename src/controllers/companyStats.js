

// A new function to get the total company stats
import CompanyStats from '../models/companyStats.js';
import { authenticateUser } from '../helpers/authHelper.js';
import mongoose from 'mongoose';

// Cache for database stats
let dbStatsCache = {
    data: null,
    lastFetched: null,
    cacheExpiry: 15 * 60 * 1000 // 5 minutes in milliseconds
};

const getDatabaseStats = async () => {
    const now = Date.now();
    
    // Return cached data if it's still valid
    if (dbStatsCache.data && dbStatsCache.lastFetched && (now - dbStatsCache.lastFetched) < dbStatsCache.cacheExpiry) {
        return dbStatsCache.data;
    }

    // Fetch fresh data from MongoDB
    const db = mongoose.connection.db;
    const dbStats = await db.stats();
    
    // Calculate total database size in MB using storageSize (matches MongoDB Atlas dashboard)
    // storageSize includes data, indexes, and preallocated space
    const storageSizeMB = (dbStats.storageSize || dbStats.dataSize) / (1024 * 1024);
    const databaseSizeLimit = 512; // MongoDB Atlas 512MB limit
    const percentageUsed = ((storageSizeMB / databaseSizeLimit) * 100).toFixed(2);

    const statsData = {
        totalDatabaseSizeMB: parseFloat(storageSizeMB.toFixed(2)),
        databaseSizeLimit,
        databasePercentageUsed: parseFloat(percentageUsed)
    };

    // Update cache
    dbStatsCache.data = statsData;
    dbStatsCache.lastFetched = now;

    return statsData;
};

export const getCompanyStats = async (req, res) => {
    try {
        const checkAuthenticatedUser = await authenticateUser(req, res);
        if (!checkAuthenticatedUser) return;
        const companyStats = await CompanyStats.findOne();

        if (!companyStats) {
            return res.status(404).json({ message: 'Company stats not found' });
        }

        // Get cached or fresh database stats
        const dbStats = await getDatabaseStats();

        // Add database size information to company stats
        const statsWithDBSize = {
            ...companyStats.toObject(),
            ...dbStats,
            vehiclesAddedThisMonth: companyStats.vehiclesAddedThisMonth
        };

        res.status(200).json({ message: 'Company stats retrieved successfully', data: statsWithDBSize });
    } catch (error) {
        console.error('Error fetching company stats:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};  
