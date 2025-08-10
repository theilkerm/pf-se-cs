import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model.js';
import AppError from '../utils/appError.js';
import crypto from 'crypto';
import sendEmail from '../utils/email.js';
import { createSendToken } from '../utils/token.js';

// Extend Express Request type to include the user property
interface CustomRequest extends Request {
  user?: IUser;
}

const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { firstName, lastName, email, password } = req.body;

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
  });

  // Generate the verification token
  const verificationToken = (newUser as any).createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  // Send the verification email
  // Frontend'deki verify-email sayfasının adresini kullanıyoruz
  const verificationURL = `http://localhost:3000/verify-email/${verificationToken}`;
  const message = `Welcome to the E-commerce Platform! Please verify your email by clicking the following link: ${verificationURL}`;

  try {
    await sendEmail({
      email: newUser.email,
      subject: 'Email Verification',
      message
    });
    
    res.status(201).json({
        status: 'success',
        message: 'Registration successful. Please check your inbox to verify your email.'
    });

  } catch (err) {
    // Eğer e-posta gönderilemezse, token'ları temizle ve hatayı bildir.
    (newUser as any).emailVerificationToken = undefined;
    await newUser.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the verification email. Please try again later.', 500));
  }
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

  // E-posta doğrulama kontrolü
  if (!user.isEmailVerified) {
    return next(new AppError('Please verify your email to log in.', 403));
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

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  req.user = currentUser;
  next();
});

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(200).json({ status: 'success', message: 'If the email is registered, a password reset link has been sent.' });
  }

  const resetToken = (user as any).createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Frontend'deki reset-password sayfasının adresini kullanıyoruz
  const resetURL = `http://localhost:3000/reset-password/${resetToken}`;
  const message = `Forgot your password? Click the link to reset it: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });

  } catch (err) {
    (user as any).passwordResetToken = undefined;
    (user as any).passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  (user as any).passwordResetToken = undefined;
  (user as any).passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({ emailVerificationToken: hashedToken });

  if (!user) {
    return next(new AppError('Token is invalid or has already been used', 400));
  }

  user.isEmailVerified = true;
  (user as any).emailVerificationToken = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Email successfully verified!'
  });
});

export const restrictTo = (...roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};