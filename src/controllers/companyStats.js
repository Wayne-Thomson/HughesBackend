

// A new function to get the total company stats
import CompanyStats from '../models/companyStats.js';
import { authenticateUser } from '../middleware/authUser.js';

export const getCompanyStats = async (req, res) => {
    try {
        const checkAuthenticatedUser = await authenticateUser(req, res);
        if (!checkAuthenticatedUser) return;
        const companyStats = await CompanyStats.findOne();

        // Include the total size used in the database in the response
        

        if (!companyStats) {
            return res.status(404).json({ message: 'Company stats not found' });
        }
        res.status(200).json({ companyStats });
    } catch (error) {
        console.error('Error fetching company stats:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};  
