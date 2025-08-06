import { Request, Response, NextFunction } from 'express';
import Review from '../models/review.model.js';
import Order from '../models/order.model.js';
import AppError from '../utils/appError.js';

interface CustomRequest extends Request {
  user?: any;
}

const catchAsync = (fn: Function) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// @desc    Create a new review for a product
// @route   POST /api/v1/reviews
// @access  Private
export const createReview = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { rating, comment, productId } = req.body;
    const userId = req.user!._id;

    // 1. Check if the user has purchased the product
    const hasPurchased = await Order.findOne({ 
        user: userId, 
        'orderItems.product': productId 
    });

    if (!hasPurchased) {
        return next(new AppError('You can only review products you have purchased.', 403));
    }
    
    // 2. Check if the user has already reviewed the product
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if(existingReview) {
        return next(new AppError('You have already reviewed this product.', 400));
    }

    const review = await Review.create({ rating, comment, product: productId, user: userId });
    
    res.status(201).json({
        status: 'success',
        message: 'Thank you for your review. It will be visible after admin approval.',
        data: { review }
    });
});

// @desc    Approve a review
// @route   PATCH /api/v1/reviews/:id/approve
// @access  Private/Admin
export const approveReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new AppError('Review not found', 404));
    }

    review.isApproved = true;
    await review.save(); // This will trigger the 'post save' hook to calculate average

    res.status(200).json({
        status: 'success',
        message: 'Review approved successfully.',
        data: { review }
    });
});