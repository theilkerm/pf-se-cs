import { Router } from 'express';
import { createCategory, getAllCategories } from '../controllers/category.controller.js';
import { protect, restrictTo } from '../controllers/auth.controller.js';

const router = Router();

// Public route - anyone can see the categories
router.get('/', getAllCategories);

// Admin only route - only admins can create a new category
router.post('/', protect, restrictTo('admin'), createCategory);

export default router;