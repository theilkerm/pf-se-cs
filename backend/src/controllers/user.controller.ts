import { Request, Response } from 'express';
import { IUser } from '../models/user.model.js';

// Extend Express Request type to include the user property
interface CustomRequest extends Request {
  user?: IUser;
}

export const getMe = (req: CustomRequest, res: Response) => {
  // The 'protect' middleware has already found the user and attached it to the request.
  // We just need to send it back.
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};