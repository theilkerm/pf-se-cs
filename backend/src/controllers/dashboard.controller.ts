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

    const orderCount = await Order.countDocuments();
    const customerCount = await User.countDocuments({ role: 'customer' });

    // If there are no orders, return early with default/empty stats
    if (orderCount === 0) {
        return res.status(200).json({
            status: 'success',
            data: {
                stats: {
                    totalSales: 0,
                    orderCount: 0,
                    customerCount,
                    recentOrders: [],
                    orderStatusDistribution: [],
                    popularProducts: [],
                    salesTrends: []
                }
            }
        });
    }

    // If orders exist, proceed with the complex aggregations
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
        totalSalesData,
        recentOrders,
        orderStatusDistribution,
        popularProducts,
        salesTrends
    ] = await Promise.all([
        Order.aggregate([
            { $match: { orderStatus: { $ne: 'Cancelled' } } },
            { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
        ]),
        Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'firstName lastName email'),
        Order.aggregate([
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
        ]),
        Order.aggregate([
            { $unwind: '$orderItems' },
            { $group: { 
                _id: '$orderItems.product',
                totalQuantitySold: { $sum: '$orderItems.quantity' } 
            }},
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails' }},
            { $unwind: '$productDetails' }
        ]),
        Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo }, orderStatus: { $ne: 'Cancelled' } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                dailySales: { $sum: '$totalPrice' },
            }},
            { $sort: { _id: 1 } }
        ])
    ]);
    
    const stats = {
        totalSales: totalSalesData.length > 0 ? totalSalesData[0].totalSales : 0,
        orderCount,
        customerCount,
        recentOrders,
        orderStatusDistribution,
        popularProducts,
        salesTrends
    };

    res.status(200).json({
        status: 'success',
        data: { stats }
    });
});