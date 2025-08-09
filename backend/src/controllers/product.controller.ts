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
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering for price (gte, lte)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let filter = JSON.parse(queryStr);

    if (req.query.search) {
        filter.name = {
            $regex: req.query.search,
            $options: 'i'
        };
    }

    // 2. Sorting
    let sort: { [key: string]: 1 | -1 } = { createdAt: -1 }; // Default sort by newest
    if (req.query.sort) {
        const sortBy = req.query.sort as string;
        if (sortBy === 'price-asc') sort = { price: 1 };
        if (sortBy === 'price-desc') sort = { price: -1 };
        if (sortBy === 'rating') sort = { averageRating: -1 }; // Sort by highest rating
    }

    // 3. Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 12; // 12 products per page
    const skip = (page - 1) * limit;

    // Execute Query
    const products = await Product.find(filter).sort(sort).skip(skip).limit(limit).populate('category');
    
    // Get total count of documents for pagination
    const totalProducts = await Product.countDocuments(filter);

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
    const productData = { ...req.body };
    
    // Check if variants is a string before parsing
    if (productData.variants && typeof productData.variants === 'string') {
        productData.variants = JSON.parse(productData.variants);
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        productData.images = req.files.map((file: any) => `/uploads/${file.filename}`);
    }

    const newProduct = await Product.create(productData);
    res.status(201).json({ status: 'success', data: { product: newProduct } });
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
    const updateData = { ...req.body };

    // Check if variants is a string before parsing
    if (updateData.variants && typeof updateData.variants === 'string') {
        updateData.variants = JSON.parse(updateData.variants);
    }
    
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
    });

    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    res.status(200).json({ status: 'success', data: { product } });
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


// @desc    Get related products (same category)
// @route   GET /api/v1/products/:id/related
// @access  Public
export const getRelatedProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id } // Exclude the current product itself
    }).limit(4); // Show up to 4 related products

    res.status(200).json({
        status: 'success',
        results: relatedProducts.length,
        data: { products: relatedProducts }
    });
});

// @desc    Get multiple products by a list of IDs
// @route   POST /api/v1/products/by-ids
// @access  Public
export const getProductsByIds = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
        return next(new AppError('Please provide an array of product IDs.', 400));
    }

    const products = await Product.find({
        _id: { $in: ids }
    });

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: { products }
    });
});