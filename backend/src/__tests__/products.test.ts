import request from 'supertest';
import mongoose from 'mongoose';
import path from 'path';
import app from '../app.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.test' });

// --- Test Setup ---
let adminToken: string;
let userToken: string;
let testCategory: any;
let testProduct: any;

// Connect to DB before all tests
beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not defined');
    await mongoose.connect(mongoUri);
});

// Create users, category, and product before each test block
beforeEach(async () => {
    // Clear all previous test data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // 1. Create Admin and Regular User
    const adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: `admin-${Date.now()}@example.com`,
        password: 'password123',
        role: 'admin'
    });
    const regularUser = await User.create({
        firstName: 'Regular',
        lastName: 'User',
        email: `user-${Date.now()}@example.com`,
        password: 'password123',
        role: 'customer'
    });

    // 2. Login users to get tokens
    const adminRes = await request(app).post('/api/v1/auth/login').send({ email: adminUser.email, password: 'password123' });
    adminToken = adminRes.body.token;

    const userRes = await request(app).post('/api/v1/auth/login').send({ email: regularUser.email, password: 'password123' });
    userToken = userRes.body.token;

    // 3. Create a test category and product
    testCategory = await Category.create({ name: 'Test Category', description: 'A test category' });
    testProduct = await Product.create({
        name: 'Test Product',
        description: 'A test product description',
        price: 99.99,
        category: testCategory._id,
        stock: 50
    });
});


// Disconnect from DB after all tests
afterAll(async () => {
    await mongoose.connection.close();
});


// --- Test Suite for Product Routes ---
describe('Product Routes - /api/v1/products', () => {

    it('GET / - should allow anyone to get a list of products', async () => {
        const res = await request(app).get('/api/v1/products');
        
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.results).toBe(1);
        expect(res.body.data.products[0].name).toBe('Test Product');
    });

    it('POST / - should NOT allow a regular user to create a product', async () => {
        const res = await request(app)
            .post('/api/v1/products')
            .set('Authorization', `Bearer ${userToken}`)
            .field('name', 'Unauthorized Product')
            .field('price', '10')
            .field('description', 'This should not be created')
            .field('stock', '10')
            .field('category', testCategory._id.toString());
        
        expect(res.statusCode).toBe(403); // Forbidden
    });
    
    it('POST / - should allow an admin to create a product with an image', async () => {
        const imagePath = path.resolve(process.cwd(), 'test-image.jpg');

        const res = await request(app)
            .post('/api/v1/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('name', 'New Admin Product')
            .field('description', 'A product created by an admin')
            .field('price', '199.99')
            .field('stock', '100')
            .field('category', testCategory._id.toString())
            .attach('images', imagePath); // This simulates file upload

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.product.name).toBe('New Admin Product');
        // Check if the dummy image path was added by the controller
        expect(res.body.data.product.images.length).toBeGreaterThan(0);
    });
    
    it('DELETE /:id - should allow an admin to delete a product', async () => {
        const res = await request(app)
            .delete(`/api/v1/products/${testProduct._id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toBe(204);

        // Verify the product is actually deleted from the database
        const productInDb = await Product.findById(testProduct._id);
        expect(productInDb).toBeNull();
    });
});