import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/user.model.js';
import AppError from '../utils/appError.js';

// Extend Express Request type to include the user property
interface CustomRequest extends Request {
  user?: IUser;
}

// This helper function wraps async functions to catch any errors and pass them to the global error handler.
const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const getMe = (req: CustomRequest, res: Response) => {
  // The 'protect' middleware has already found the user and attached it to the request.
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};

// @desc    Get all users (customers)
// @route   GET /api/v1/users
// @access  Private/Admin
export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find({ role: 'customer' });

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});

// @desc    Get single user by ID with their orders
// @route   GET /api/v1/users/:id
// @access  Private/Admin
export const getUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // We populate the virtual 'orders' field
    const user = await User.findById(req.params.id).populate('orders');

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

// @desc    Update user
// @route   PATCH /api/v1/users/:id
// @access  Private/Admin
export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});