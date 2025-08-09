import { Request, Response, NextFunction } from 'express';
import Category from '../models/category.model.js';
import AppError from '../utils/appError.js';

const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// FOR PUBLIC: Get all ACTIVE categories
export const getAllCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const categories = await Category.find({ isActive: true });
    res.status(200).json({
        status: 'success',
        results: categories.length,
        data: { categories }
    });
});

// FOR ADMIN: Get ALL categories (active and inactive)
export const getAdminCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({
        status: 'success',
        results: categories.length,
        data: { categories }
    });
});

// FOR ADMIN: Get a single category by ID
export const getCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new AppError('No category found with that ID', 404));
    }
    res.status(200).json({ status: 'success', data: { category } });
});

// FOR ADMIN: Create a new category
export const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description } = req.body;
    const newCategory = await Category.create({ name, description });
    res.status(201).json({
        status: 'success',
        data: { category: newCategory }
    });
});

// FOR ADMIN: Update a category
export const updateCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!category) {
        return next(new AppError('No category found with that ID', 404));
    }
    res.status(200).json({ status: 'success', data: { category } });
});

// FOR ADMIN: Delete a category (soft delete)
export const deleteCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // In a real-world scenario, you should check if any products are using this category first.
    // For this case, we will just deactivate it.
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!category) {
        return next(new AppError('No category found with that ID', 404));
    }
    res.status(204).json({ status: 'success', data: null });
});
