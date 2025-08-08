import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById } from '../controllers/order.controller.js';
import { protect } from '../controllers/auth.controller.js';

const router = Router();

router.use(protect);

router.route('/')
    .post(createOrder);

router.route('/my-orders')
    .get(getMyOrders);

router.route('/:id')
    .get(getOrderById);

export default router;