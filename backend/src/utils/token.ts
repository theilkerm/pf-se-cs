import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { IUser } from '../models/user.model.js';

const signToken = (id: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  const payload = { id };
  const options: jwt.SignOptions = { 
    expiresIn: (process.env.JWT_EXPIRES_IN || '90d') as jwt.SignOptions['expiresIn']
  };
  
  return jwt.sign(payload, secret, options);
};

export const createSendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = signToken((user._id as any).toString());

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