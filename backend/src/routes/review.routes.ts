import { Router } from 'express';
import { createReview, approveReview, getAllReviews, deleteReview} from '../controllers/review.controller.js';
import { protect, restrictTo } from '../controllers/auth.controller.js';

const router = Router();

// Any user can create a review (we check for purchase in controller)
router.post('/', protect, createReview);

// Only admins can approve reviews
router.patch('/:id/approve', protect, restrictTo('admin'), approveReview);



// Only admins can get all reviews
router.get('/admin', protect, restrictTo('admin'), getAllReviews);

// only admins can delete reviews
router.delete('/:id', protect, restrictTo('admin'), deleteReview);

export default router;