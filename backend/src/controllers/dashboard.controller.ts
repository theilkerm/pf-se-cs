import { Request, Response, NextFunction } from 'express';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';

const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// @desc    Get dashboard statistics
// @route   GET /api/v1/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    // Run independent queries in parallel for efficiency
    const [
        totalSalesData,
        orderCount,
        customerCount,
        recentOrders,
        orderStatusDistribution,
        popularProducts
    ] = await Promise.all([
        // 1. Calculate total sales (sum of totalPrice for non-cancelled orders)
        Order.aggregate([
            { $match: { orderStatus: { $ne: 'Cancelled' } } },
            { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
        ]),
        // 2. Count total orders
        Order.countDocuments(),
        // 3. Count total customers
        User.countDocuments({ role: 'customer' }),
        // 4. Get 5 most recent orders
        Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'firstName lastName email'),
        // 5. Get order status distribution
        Order.aggregate([
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
        ]),
        // 6. Get 5 most popular (most sold) products
        Order.aggregate([
            { $unwind: '$orderItems' }, // Deconstruct the orderItems array
            { $group: { 
                _id: '$orderItems.product', // Group by product ID
                totalQuantitySold: { $sum: '$orderItems.quantity' } 
            }},
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 5 },
            { $lookup: { // Join with the products collection to get product details
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productDetails'
            }},
            { $unwind: '$productDetails' }
        ])
    ]);
    
    // Format the response
    const stats = {
        totalSales: totalSalesData.length > 0 ? totalSalesData[0].totalSales : 0,
        orderCount,
        customerCount,
        recentOrders,
        orderStatusDistribution,
        popularProducts
    };

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});