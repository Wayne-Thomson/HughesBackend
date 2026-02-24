import express from 'express';
import { getCompanyStats } from '../controllers/companyStats.js';
import { authUser } from '../middleware/authUser.js';

const router = express.Router();

// Get company stats
router.get('/stats', authUser, getCompanyStats);

export default router;
