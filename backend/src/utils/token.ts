import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { IUser } from '../models/user.model.js';

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN!,
  });
};

export const createSendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = signToken(user._id.toString());

  // Remove password from output for security
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};