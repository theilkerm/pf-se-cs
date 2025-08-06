import { Request, Response, NextFunction } from 'express';
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

// @desc    Get user's shopping cart
// @route   GET /api/v1/cart
// @access  Private
export const getCart = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user!._id).populate({
        path: 'cart.product',
        select: 'name images price'
    });

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            cart: user.cart
        }
    });
});

// @desc    Add item to cart
// @route   POST /api/v1/cart
// @access  Private
export const addItemToCart = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { productId, quantity } = req.body;
    const user = req.user!;

    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    

    const itemIndex = user.cart.findIndex(item => item.product.toString() === productId);
    const currentQuantityInCart = itemIndex > -1 ? user.cart[itemIndex].quantity : 0;
    const requestedTotalQuantity = currentQuantityInCart + quantity;

    if (product.stock < requestedTotalQuantity) {
      return next(
        new AppError(
          `Insufficient stock. Only ${product.stock} items available. You already have ${currentQuantityInCart} in your cart.`,
          400
        )
      );
    }
    
    if (itemIndex > -1) {
        // Product exists in cart, update quantity
        user.cart[itemIndex].quantity += quantity;
    } else {
        // Product does not exist in cart, add new item
        user.cart.push({ product: productId, quantity, price: product.price });
    }

    await user.save({ validateBeforeSave: false }); // Skip validation for other fields

    res.status(200).json({
        status: 'success',
        message: 'Item added to cart',
        data: {
            cart: user.cart
        }
    });
});

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/:productId
// @access  Private
export const removeItemFromCart = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const user = req.user!;

    user.cart = user.cart.filter(item => item.product.toString() !== productId);

    await user.save({ validateBeforeSave: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});