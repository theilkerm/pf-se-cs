import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import AppError from '../utils/appError.js';

const validate = (schema: AnyZodObject) => 
    (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });
        next();
    } catch (e: any) {
        const formattedErrors = e.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
        }));
        
        return next(new AppError('Invalid input data', 400, formattedErrors));
    }
};

export default validate;