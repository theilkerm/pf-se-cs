import { Router } from 'express';
import { getCart, addItemToCart, removeItemFromCart, updateItemQuantity, clearCart } from '../controllers/cart.controller.js';
import { protect } from '../controllers/auth.controller.js';

const router = Router();

router.use(protect);

router.route('/')
    .get(getCart)
    .post(addItemToCart)
    .patch(updateItemQuantity)
    .delete(clearCart);

// Use a more specific parameter name
router.route('/:cartItemId')
    .delete(removeItemFromCart);

export default router;