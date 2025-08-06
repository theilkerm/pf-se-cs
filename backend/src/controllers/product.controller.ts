import { Request, Response, NextFunction } from 'express';
import Product from '../models/product.model.js';
import AppError from '../utils/appError.js';
import Review from '../models/review.model.js';

const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
export const getAllProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Basic filtering by category
    const filter = req.query.category ? { category: req.query.category } : {};
    
    const products = await Product.find(filter).populate('category');
    
    res.status(200).json({
        status: 'success',
        results: products.length,
        data: {
            products
        }
    });
});

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private/Admin
export const createProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // In a real app, you would process req.files here, upload them to a cloud service (like AWS S3),
    // and get back the URLs to store in the database.
    // For now, we'll just log them to show they are received.
    console.log(req.files); 

    // We will manually add some dummy image URLs.
    const productData = { ...req.body };
    if (req.files) {
        // Dummy URL logic
        productData.images = ['/img/dummy-product-1.jpg', '/img/dummy-product-2.jpg'];
    }

    const newProduct = await Product.create(productData);
    
    res.status(201).json({
        status: 'success',
        data: {
            product: newProduct
        }
    });
});

// @desc    Get a single product by ID
// @route   GET /api/v1/products/:id
// @access  Public
export const getProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });
});

// @desc    Update a product
// @route   PATCH /api/v1/products/:id
// @access  Private/Admin
export const updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // Return the updated document
        runValidators: true // Run schema validators
    });

    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });
});

// @desc    Delete a product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
export const deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }
    
    // Also delete all reviews associated with this product
    await Review.deleteMany({ product: req.params.id });

    res.status(204).json({
        status: 'success',
        data: null
    });
});