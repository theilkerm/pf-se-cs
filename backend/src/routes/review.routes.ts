import { Router } from 'express';
import { createReview, approveReview } from '../controllers/review.controller.js';
import { protect, restrictTo } from '../controllers/auth.controller.js';

const router = Router();

// Any user can create a review (we check for purchase in controller)
router.post('/', protect, createReview);

// Only admins can approve reviews
router.patch('/:id/approve', protect, restrictTo('admin'), approveReview);

export default router;