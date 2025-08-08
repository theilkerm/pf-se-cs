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

// @desc    Create a new order from cart
// @route   POST /api/v1/orders
// @access  Private
export const createOrder = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { shippingAddress } = req.body;
    const user = await User.findById(req.user!._id).populate('cart.product');

    if (!user || user.cart.length === 0) {
        return next(new AppError('Your cart is empty', 400));
    }
    
    if (!shippingAddress) {
        return next(new AppError('Shipping address is required', 400));
    }

    // 1. Prepare order items and calculate total price
    const orderItems = user.cart.map(item => ({
        name: (item.product as any).name,
        quantity: item.quantity,
        price: item.price,
        image: (item.product as any).images[0] || '/img/default.jpg',
        product: item.product._id,
    }));

    const totalPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // 2. Create the order
    const order = await Order.create({
        user: user._id,
        orderItems,
        shippingAddress,
        totalPrice,
    });

    // 3. Decrement product stock
    for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
        });
    }

    // 4. Clear the user's cart
    user.cart = [];
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
        status: 'success',
        data: {
            order
        }
    });
});

// @desc    Get logged in user's orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
export const getMyOrders = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    // Find orders and populate the product details within orderItems
    const orders = await Order.find({ user: req.user!._id })
        .populate('orderItems.product', 'name price') // Populate product details
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
            orders
        }
    });
});

// @desc    Get a single order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrderById = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('Order not found with that ID', 404));
    }



    if (order.user.toString() !== req.user!._id.toString()) {
        return next(new AppError('Not authorized to view this order', 403));
    }

    // We populate here, after the authorization check
    await order.populate({ path: 'orderItems.product', select: 'name images' });

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});