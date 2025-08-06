import { Router } from 'express';
import { createOrder, getMyOrders } from '../controllers/order.controller.js';
import { protect } from '../controllers/auth.controller.js';

const router = Router();

// All routes are protected
router.use(protect);

router.route('/')
    .post(createOrder);

router.route('/my-orders')
    .get(getMyOrders);

export default router;