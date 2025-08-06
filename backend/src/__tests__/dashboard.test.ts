import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/user.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.test' });

describe('Dashboard Routes - /api/v1/dashboard', () => {
    
    let adminToken: string;

    beforeAll(async () => {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) throw new Error('MONGO_URI not defined');
        await mongoose.connect(mongoUri);
    });

    beforeEach(async () => {
        // Clear all collections
        await User.deleteMany({});
        await Order.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});

        // Create an admin user and get token
        const adminUser = await User.create({
            firstName: 'Dashboard', lastName: 'Admin', email: `dash-admin-${Date.now()}@example.com`, password: 'password123', role: 'admin'
        });
        const res = await request(app).post('/api/v1/auth/login').send({ email: adminUser.email, password: 'password123' });
        adminToken = res.body.token;

        // Create mock data
        const customer = await User.create({ firstName: 'Dash', lastName: 'Customer', email: `dash-cust-${Date.now()}@example.com`, password: 'password123' });
        const category = await Category.create({ name: 'Dashboard Category' });
        const product = await Product.create({ name: 'Dash Product', description: 'desc', price: 150, category: category._id, stock: 10 });
        
        // Create a mock order
        await Order.create({
            user: customer._id,
            orderItems: [{ name: product.name, quantity: 2, price: 150, image: 'test.jpg', product: product._id }],
            shippingAddress: { street: '123', city: 'Test', state: 'TS', zipCode: '123', country: 'Testland' },
            totalPrice: 300, // 150 * 2
            orderStatus: 'Delivered'
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('GET /stats - should return dashboard statistics for an admin', async () => {
        const res = await request(app)
            .get('/api/v1/dashboard/stats')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');

        const stats = res.body.data.stats;
        expect(stats.totalSales).toBe(300);
        expect(stats.orderCount).toBe(1);
        expect(stats.customerCount).toBe(1);
        expect(stats.recentOrders).toHaveLength(1);
        expect(stats.popularProducts).toHaveLength(1);
        expect(stats.popularProducts[0].productDetails.name).toBe('Dash Product');
    });
});