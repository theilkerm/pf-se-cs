import { Request, Response, NextFunction } from 'express';
import Product from '../models/product.model.js';
import Review from '../models/review.model.js';
import AppError from '../utils/appError.js';
import { IUser } from '../models/user.model.js';

interface CustomRequest extends Request {
  user?: IUser;
}

const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const getAllProducts = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const queryObj: { [key: string]: any } = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    let filter = JSON.parse(queryStr);

    if (req.query.search) {
        filter.name = { $regex: req.query.search, $options: 'i' };
    }
    
    // --- CORRECTED LOGIC ---
    // If the request is coming from the admin panel, we don't need to filter by isActive.
    // The frontend admin product page does not send an 'isActive' filter.
    // Public users will not have req.user, and customers will have req.user.role === 'customer'.
    // We only apply the isActive filter if the user is NOT an admin.
    // The check for req.user is important for public (unauthenticated) requests.
    if (req.user?.role !== 'admin') {
        filter.isActive = true;
    }
    

    let sort: { [key: string]: 1 | -1 } = { createdAt: -1 };
    if (req.query.sort) {
        const sortBy = req.query.sort as string;
        if (sortBy === 'price-asc') sort = { price: 1 };
        if (sortBy === 'price-desc') sort = { price: -1 };
        if (sortBy === 'rating') sort = { averageRating: -1 };
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 1000; // Increased limit for admin view
    const skip = (page - 1) * limit;

    const products = await Product.find(filter).sort(sort).skip(skip).limit(limit).populate('category');
    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: { products, page, totalPages: Math.ceil(totalProducts / limit) }
    });
});

export const getProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.params.id).populate('category').populate({ path: 'reviews', match: { isApproved: true } });
    if (!product) { return next(new AppError('No product found with that ID', 404)); }
    res.status(200).json({ status: 'success', data: { product } });
});

export const createProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const productData = { ...req.body };
    if (productData.variants && typeof productData.variants === 'string') {
        productData.variants = JSON.parse(productData.variants);
    }
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        productData.images = req.files.map((file: any) => `/uploads/${file.filename}`);
    }
    const newProduct = await Product.create(productData);
    res.status(201).json({ status: 'success', data: { product: newProduct } });
});

export const updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const updateData = { ...req.body };
    if (updateData.variants && typeof updateData.variants === 'string') {
        updateData.variants = JSON.parse(updateData.variants);
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!product) { return next(new AppError('No product found with that ID', 404)); }
    res.status(200).json({ status: 'success', data: { product } });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) { return next(new AppError('No product found with that ID', 404)); }
    await Review.deleteMany({ product: req.params.id });
    res.status(204).json({ status: 'success', data: null });
});

export const bulkUpdateProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { productIds, action } = req.body;
    if (!productIds || !Array.isArray(productIds) || !action) {
        return next(new AppError('Please provide product IDs and an action.', 400));
    }
    let update;
    switch (action) {
        case 'activate':
            update = { isActive: true };
            break;
        case 'deactivate':
            update = { isActive: false };
            break;
        default:
            return next(new AppError('Invalid bulk action.', 400));
    }
    await Product.updateMany({ _id: { $in: productIds } }, { $set: update });
    res.status(200).json({ status: 'success', message: `Successfully performed '${action}' on ${productIds.length} products.` });
});

export const getRelatedProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }
    const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
        isActive: true // Ensure related products are active
    }).limit(4);
    res.status(200).json({
        status: 'success',
        results: relatedProducts.length,
        data: { products: relatedProducts }
    });
});

export const getProductsByIds = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
        return next(new AppError('Please provide an array of product IDs.', 400));
    }
    const products = await Product.find({ _id: { $in: ids } });
    res.status(200).json({
        status: 'success',
        results: products.length,
        data: { products }
    });
});

export const getAdminProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // This admin-only function does NOT filter by `isActive`
    const products = await Product.find().sort({ createdAt: -1 }).populate('category');
    
    res.status(200).json({
        status: 'success',
        results: products.length,
        data: { products }
    });
});