import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model.js'; // .js uzantısı ESM modüllerinde gereklidir
import AppError from '../utils/appError.js';

// A simple utility to wrap async functions for error handling
const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password } = req.body;

    // 1) Basic validation
    if (!firstName || !lastName || !email || !password) {
      return next(new AppError('Please provide all required fields', 400));
    }

    // 2) Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    // 3) Create new user
    // Password will be hashed by the pre-save middleware in the model
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    // We don't want to send the password back, even if it's hashed.
    // The 'select: false' in the schema helps, but let's be explicit.
    newUser.password = undefined;

    // TODO: Create and send JWT token as per case study requirements

    // 4) Send response
    res.status(201).json({
      status: 'success',
      // TODO: Add token here
      data: {
        user: newUser,
      },
    });
  }
);

// We will add login controller here later
export const login = (req: Request, res: Response) => {
    res.status(500).json({ status: 'error', message: 'Route not defined yet!'});
}