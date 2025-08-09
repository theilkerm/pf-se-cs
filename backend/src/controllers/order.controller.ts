import { Request, Response, NextFunction } from 'express';
import Order from '../models/order.model.js';
import User, { IUser } from '../models/user.model.js';
import Product from '../models/product.model.js';
import AppError from '../utils/appError.js';

interface CustomRequest extends Request {
    user?: IUser;
}

const catchAsync = (fn: Function) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};

export const createOrder = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { shippingAddress } = req.body;
    const user = await User.findById(req.user!._id).populate({
        path: 'cart.product',
        model: 'Product'
    });

    if (!user || user.cart.length === 0) {
        return next(new AppError('Your cart is empty', 400));
    }
    if (!shippingAddress) {
        return next(new AppError('Shipping address is required', 400));
    }

    const orderItems = user.cart.map((item: any) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product.images[0] || '/img/default.jpg',
        product: item.product._id,
        variant: item.variant
    }));

    const totalPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const order = await Order.create({
        user: user._id,
        orderItems,
        shippingAddress,
        totalPrice,
    });

    for (const item of order.orderItems) {
        if (item.variant) {
             await Product.updateOne(
                { _id: item.product, 'variants.value': item.variant.value, 'variants.type': item.variant.type },
                { $inc: { 'variants.$.stock': -item.quantity } }
            );
        }
    }

    user.cart = [];
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
        status: 'success',
        data: {
            order
        }
    });
});

export const getMyOrders = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const orders = await Order.find({ user: req.user!._id }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
});

export const getOrderById = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('Order not found with that ID', 404));
    }
    if (order.user.toString() !== req.user!._id.toString()) {
        return next(new AppError('Not authorized to view this order', 403));
    }
    
    await order.populate({ path: 'orderItems.product', select: 'name images' });

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});

// @desc    Get all orders (for admin)
// @route   GET /api/v1/orders
// @access  Private/Admin
export const getAllOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const orders = await Order.find().populate('user', 'firstName lastName').sort({ createdAt: -1 });
    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: { orders }
    });
});

// @desc    Update order status (for admin)
// @route   PATCH /api/v1/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('Order not found with that ID', 404));
    }

    order.orderStatus = status;
    if (status === 'Delivered') {
        order.deliveredAt = new Date();
    }
    await order.save();

    res.status(200).json({
        status: 'success',
        data: { order }
    });
});