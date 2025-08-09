import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus } from '../controllers/order.controller.js';
import { protect, restrictTo } from '../controllers/auth.controller.js';

const router = Router();

router.use(protect);

// Customer route
router.get('/my-orders', getMyOrders);

// Admin routes
router.route('/')
    .post(createOrder) // Customers also create orders, so no restrictTo here
    .get(restrictTo('admin'), getAllOrders); // Only admins get all orders

router.route('/:id')
    .get(getOrderById);

router.route('/:id/status')
    .patch(restrictTo('admin'), updateOrderStatus);

export default router;