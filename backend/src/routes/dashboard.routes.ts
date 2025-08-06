import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { protect, restrictTo } from '../controllers/auth.controller.js';

const router = Router();

// All routes are for admins only
router.use(protect, restrictTo('admin'));

router.get('/stats', getDashboardStats);

export default router;