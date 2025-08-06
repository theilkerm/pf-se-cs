import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import Order from '../models/order.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.test' });

describe('Order Routes - /api/v1/orders', () => {
    
    let userToken: string;
    let testUser: any;
    let testProduct: any;

    beforeAll(async () => {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) throw new Error('MONGO_URI not defined');
        await mongoose.connect(mongoUri);
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});
        await Order.deleteMany({});

        testUser = await User.create({
            firstName: 'Order',
            lastName: 'User',
            email: `order-user-${Date.now()}@example.com`,
            password: 'password123',
        });
        
        const res = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: 'password123' });
        userToken = res.body.token;

        const category = await Category.create({ name: 'Order Test Category' });
        testProduct = await Product.create({
            name: 'Product for Order',
            description: 'A product for the order test', // <-- EKSİK OLAN SATIR BURAYA EKLENDİ
            price: 100,
            category: category._id,
            stock: 20
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('POST / - should create an order if user has items in cart', async () => {
        await User.findByIdAndUpdate(testUser._id, {
            cart: [{ product: testProduct._id, quantity: 2, price: testProduct.price }]
        });

        const res = await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ shippingAddress: { street: '123 Test', city: 'Test', state: 'TS', zipCode: '123', country: 'Testland' } });

        expect(res.statusCode).toBe(201);
        expect(res.body.data.order.totalPrice).toBe(200);

        const userAfterOrder = await User.findById(testUser._id);
        expect(userAfterOrder!.cart).toHaveLength(0);

        const productAfterOrder = await Product.findById(testProduct._id);
        expect(productAfterOrder!.stock).toBe(18);
    });

    it('POST / - should fail to create an order if the cart is empty', async () => {
        const res = await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ shippingAddress: { street: '123 Empty', city: 'Test', state: 'TS', zipCode: '123', country: 'Testland' } });
            
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Your cart is empty');
    });

    it('GET /my-orders - should get the logged-in user\'s order history', async () => {
        await Order.create({
            user: testUser._id,
            orderItems: [{ name: 'Test Item', quantity: 1, price: 50, image: 'test.jpg', product: testProduct._id }],
            shippingAddress: { street: '123 History', city: 'Test', state: 'TS', zipCode: '123', country: 'Testland' },
            totalPrice: 50
        });

        const res = await request(app)
            .get('/api/v1/orders/my-orders')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.results).toBe(1);
        expect(res.body.data.orders[0].totalPrice).toBe(50);
    });
});