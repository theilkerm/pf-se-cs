import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/user.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.test' });

// --- Test Suite for Admin User Management Routes ---
describe('Admin User Management Routes - /api/v1/users', () => {
    
    let adminToken: string;
    let customer1: any;
    let customer2: any;

    // --- Test Setup ---
    beforeAll(async () => {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) throw new Error('MONGO_URI not defined');
        await mongoose.connect(mongoUri);
    });

    // Before each test, create an admin and two customer users
    beforeEach(async () => {
        // Clear previous data
        await User.deleteMany({});
        await Order.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});

        // Create an admin user and log in to get the token
        const adminUser = await User.create({
            firstName: 'Main', lastName: 'Admin', email: `main-admin-${Date.now()}@example.com`, password: 'password123', role: 'admin'
        });
        const res = await request(app).post('/api/v1/auth/login').send({ email: adminUser.email, password: 'password123' });
        adminToken = res.body.token;

        // Create two customer users
        customer1 = await User.create({
            firstName: 'Customer', lastName: 'One', email: `customer1-${Date.now()}@example.com`, password: 'password123'
        });
        customer2 = await User.create({
            firstName: 'Customer', lastName: 'Two', email: `customer2-${Date.now()}@example.com`, password: 'password123'
        });

        // Create an order for customer1 to test order history population
        const category = await Category.create({ name: 'Admin User Test Category' });
        const product = await Product.create({ name: 'Product for Order', description: 'desc', price: 100, category: category._id, stock: 20 });
        await Order.create({
            user: customer1._id,
            orderItems: [{ name: 'Test Item', quantity: 1, price: 50, image: 'test.jpg', product: product._id }],
            shippingAddress: { street: '123', city: 'Test', state: 'TS', zipCode: '123', country: 'Testland' },
            totalPrice: 50
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    // --- Test Cases ---

    it('GET / - should allow an admin to get a list of all customers', async () => {
        const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.results).toBe(2); // We created two customers
        expect(res.body.data.users[0].email).toBe(customer1.email);
    });

    it('GET / - should NOT allow a regular user to get the user list', async () => {
        // Login as a customer to get a customer token
        const customerRes = await request(app).post('/api/v1/auth/login').send({ email: customer1.email, password: 'password123' });
        const customerToken = customerRes.body.token;

        const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${customerToken}`);
        
        expect(res.statusCode).toBe(403); // Forbidden
    });
    
    it('GET /:id - should allow an admin to get a single customer with their order history', async () => {
        const res = await request(app)
            .get(`/api/v1/users/${customer1._id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.data.user.email).toBe(customer1.email);
        // CRITICAL: Check if the virtual 'orders' field is populated
        expect(res.body.data.user.orders).toBeDefined();
        expect(res.body.data.user.orders).toHaveLength(1);
        expect(res.body.data.user.orders[0].totalPrice).toBe(50);
    });

    it('DELETE /:id - should allow an admin to delete a customer', async () => {
        const res = await request(app)
            .delete(`/api/v1/users/${customer2._id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toBe(204);

        // Verify the user is actually deleted
        const userInDb = await User.findById(customer2._id);
        expect(userInDb).toBeNull();
    });
});