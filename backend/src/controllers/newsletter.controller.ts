import { Request, Response, NextFunction } from 'express';
import Subscriber from '../models/subscriber.model.js';
import AppError from '../utils/appError.js';

const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const subscribeToNewsletter = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) {
        return next(new AppError('Please provide an email address.', 400));
    }

    // Using findOneAndUpdate with upsert to handle existing subscribers gracefully
    await Subscriber.findOneAndUpdate(
        { email: email },
        { email: email },
        { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
        status: 'success',
        message: 'Thank you for subscribing!'
    });
});

// --- YENİ FONKSİYON ---
// @desc    Get all subscribers (for admin)
// @route   GET /api/v1/newsletter
// @access  Private/Admin
export const getAllSubscribers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        results: subscribers.length,
        data: { subscribers }
    });
});