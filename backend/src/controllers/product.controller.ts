import { Request, Response, NextFunction } from 'express';
import Product from '../models/product.model.js';
import AppError from '../utils/appError.js';
import Review from '../models/review.model.js';

const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/v1/products
// @access  Public
export const getAllProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Filtering
    const queryObj: { [key: string]: any } = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    // Example: ?category=categoryId

    // 2. Sorting
    let sort: { [key: string]: 1 | -1 } = { createdAt: -1 }; // Default sort by newest
    if (req.query.sort) {
        const sortBy = req.query.sort as string;
        if (sortBy === 'price-asc') sort = { price: 1 };
        if (sortBy === 'price-desc') sort = { price: -1 };
    }

    // 3. Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 12; // 12 products per page
    const skip = (page - 1) * limit;

    // Execute Query
    const products = await Product.find(queryObj).sort(sort).skip(skip).limit(limit).populate('category');
    
    // Get total count of documents for pagination
    const totalProducts = await Product.countDocuments(queryObj);

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: {
            products,
            page,
            totalPages: Math.ceil(totalProducts / limit)
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
    const product = await Product.findById(req.params.id)
        .populate('category')
        .populate({ 
            path: 'reviews',
            match: { isApproved: true }
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