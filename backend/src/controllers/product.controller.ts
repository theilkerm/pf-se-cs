import { Request, Response, NextFunction } from 'express';
import Product from '../models/product.model.js';
import AppError from '../utils/appError.js';

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