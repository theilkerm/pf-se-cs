import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model.js';
import AppError from '../utils/appError.js';

// Extend Express Request type to include the user property
interface CustomRequest extends Request {
  user?: IUser;
}

const signToken = (id: string) => {
  // CORRECTED: Added '!' to assert that environment variables exist.
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN!,
  });
};

const createSendToken = (user: IUser, statusCode: number, res: Response) => {
  // CORRECTED: Converted user._id (ObjectId) to a string before passing.
  const token = signToken(user._id.toString());

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return next(new AppError('Please provide all required fields', 400));
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
    });
    
    createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }
    
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, res);
});

export const protect = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // CORRECTED: Removed unnecessary and incorrect 'promisify' wrapper.
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }
  
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403) // 403 Forbidden
      );
    }
    next();
  };
};
