import { Request, Response, NextFunction } from 'express';
import Category from '../models/category.model.js';
import AppError from '../utils/appError.js';

const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// @desc    Create a new category
// @route   POST /api/v1/categories
// @access  Private/Admin
export const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, image } = req.body;
    const newCategory = await Category.create({ name, description, image });
    res.status(201).json({
        status: 'success',
        data: {
            category: newCategory
        }
    });
});

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
export const getAllCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const categories = await Category.find({ isActive: true });
    res.status(200).json({
        status: 'success',
        results: categories.length,
        data: {
            categories
        }
    });
});

// We will add get, update, delete later as needed.