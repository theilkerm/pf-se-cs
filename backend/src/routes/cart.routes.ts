import { Router } from 'express';
import { getCart, addItemToCart, removeItemFromCart, updateItemQuantity, clearCart } from '../controllers/cart.controller.js';
import { protect } from '../controllers/auth.controller.js';

const router = Router();

// All routes below this will be protected
router.use(protect);

router.route('/')
    .get(getCart)
    .post(addItemToCart)
    .patch(updateItemQuantity)
    .delete(clearCart);

router.route('/:productId')
    .delete(removeItemFromCart);

export default router;