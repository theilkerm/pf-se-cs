import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js';
import { protect } from '../controllers/auth.controller.js';

const router = Router();

router.use(protect); // All wishlist routes are protected

router.route('/')
    .get(getWishlist)
    .post(addToWishlist);

router.route('/:productId')
    .delete(removeFromWishlist);

export default router;