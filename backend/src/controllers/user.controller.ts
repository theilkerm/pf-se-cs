import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/user.model.js';
import AppError from '../utils/appError.js';
import { createSendToken } from '../utils/token.js';


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
    const filter: { [key: string]: any } = { role: 'customer' };

    if (req.query.search) {
        const searchRegex = new RegExp(req.query.search as string, 'i');
        // Search in multiple fields: firstName, lastName, email
        filter.$or = [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex }
        ];
    }

    const users = await User.find(filter);

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

// @desc    Update current logged in user's data (name, email)
// @route   PATCH /api/v1/users/update-me
// @access  Private
export const updateMe = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    // 1) Filter out unwanted fields names that are not allowed to be updated
    const { firstName, lastName, email } = req.body;
    const filteredBody: { [key: string]: any } = { firstName, lastName, email };

    // 2) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user!.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

// @desc    Update current logged in user's password
// @route   PATCH /api/v1/users/update-my-password
// @access  Private
export const updateMyPassword = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { currentPassword, password, passwordConfirm } = req.body;

    // 1) Get user from collection
    const user = await User.findById(req.user!._id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!user || !(await user.correctPassword(currentPassword, user.password))) {
        return next(new AppError('Your current password is incorrect', 401));
    }

    // 3) If so, update password
    user.password = password;
    // The pre-save middleware will re-hash the new password
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
});


// @desc    Add a new address for the logged-in user
// @route   POST /api/v1/users/me/addresses
// @access  Private
export const addAddress = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user!._id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }
    
    user.addresses.push(req.body);
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
        status: 'success',
        data: {
            user
        }
    });
});

// @desc    Update an existing address for the logged-in user
// @route   PATCH /api/v1/users/me/addresses/:addressId
// @access  Private
export const updateAddress = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user!._id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const addressIndex = user.addresses.findIndex((addr: any) => addr._id.toString() === req.params.addressId);
    if (addressIndex === -1) {
        return next(new AppError('Address not found', 404));
    }

    Object.assign(user.addresses[addressIndex], req.body);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});


// @desc    Delete an address for the logged-in user
// @route   DELETE /api/v1/users/me/addresses/:addressId
// @access  Private
export const deleteAddress = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user!._id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }
    
    const addressIndex = user.addresses.findIndex((addr: any) => addr._id.toString() === req.params.addressId);
    if (addressIndex === -1) {
        return next(new AppError('Address not found', 404));
    }

    user.addresses.splice(addressIndex, 1);
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
        status: 'success',
        data: {
          user,
        },
    });
});