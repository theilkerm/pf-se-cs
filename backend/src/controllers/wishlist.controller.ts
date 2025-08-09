import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/user.model.js';
import AppError from '../utils/appError.js';

interface CustomRequest extends Request {
  user?: IUser;
}

const catchAsync = (fn: Function) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const getWishlist = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user!._id).populate('wishlist');
    if (!user) { return next(new AppError('User not found', 404)); }

    res.status(200).json({
        status: 'success',
        data: { wishlist: user.wishlist }
    });
});

export const addToWishlist = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { productId } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user!._id,
        { $addToSet: { wishlist: productId } }, // $addToSet prevents duplicates
        { new: true }
    ).populate('wishlist');

    res.status(200).json({
        status: 'success',
        data: { wishlist: user!.wishlist }
    });
});

export const removeFromWishlist = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const user = await User.findByIdAndUpdate(
        req.user!._id,
        { $pull: { wishlist: productId } }, // $pull removes the item
        { new: true }
    ).populate('wishlist');

    res.status(200).json({
        status: 'success',
        data: { wishlist: user!.wishlist }
    });
});