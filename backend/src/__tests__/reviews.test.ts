import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import Order from '../models/order.model.js';
import Review from '../models/review.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.test' });

// --- Test Suite for Review Routes ---
describe('Review Routes - /api/v1/reviews', () => {
    
    let adminToken: string;
    let userToken: string;
    let testUser: any;
    let purchasedProduct: any;
    let notPurchasedProduct: any;

    // --- Test Setup ---
    beforeAll(async () => {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) throw new Error('MONGO_URI not defined');
        await mongoose.connect(mongoUri);
    });

    // Before each test, create users, products, and an order to simulate a purchase
    beforeEach(async () => {
        // Clear previous data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});
        await Order.deleteMany({});
        await Review.deleteMany({});

        // Create Admin and Regular User
        const adminUser = await User.create({
            firstName: 'ReviewAdmin', lastName: 'User', email: `review-admin-${Date.now()}@example.com`, password: 'password123', role: 'admin'
        });
        testUser = await User.create({
            firstName: 'Reviewer', lastName: 'User', email: `reviewer-${Date.now()}@example.com`, password: 'password123'
        });

        // Login users to get tokens
        const adminRes = await request(app).post('/api/v1/auth/login').send({ email: adminUser.email, password: 'password123' });
        adminToken = adminRes.body.token;
        const userRes = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: 'password123' });
        userToken = userRes.body.token;

        // Create products
        const category = await Category.create({ name: 'Review Test Category' });
        purchasedProduct = await Product.create({
            name: 'Purchased Product', description: 'This was purchased', price: 10, category: category._id, stock: 10
        });
        notPurchasedProduct = await Product.create({
            name: 'Not Purchased Product', description: 'This was not purchased', price: 20, category: category._id, stock: 10
        });

        // CRITICAL: Create an order to establish purchase history for the user
        await Order.create({
            user: testUser._id,
            orderItems: [{ name: purchasedProduct.name, quantity: 1, price: purchasedProduct.price, image: 'test.jpg', product: purchasedProduct._id }],
            shippingAddress: { street: '123', city: 'Test', state: 'TS', zipCode: '12345', country: 'Testland' },
            totalPrice: 10,
            orderStatus: 'Delivered'
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    // --- Test Cases ---

    it('POST / - should allow a user to review a product they have purchased', async () => {
        const res = await request(app)
            .post('/api/v1/reviews')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                productId: purchasedProduct._id,
                rating: 5,
                comment: 'Excellent product!'
            });
        
        expect(res.statusCode).toBe(201);
        expect(res.body.data.review.comment).toBe('Excellent product!');
        expect(res.body.data.review.isApproved).toBe(false); // Should be unapproved by default
    });

    it('POST / - should NOT allow a user to review a product they have NOT purchased', async () => {
        const res = await request(app)
            .post('/api/v1/reviews')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                productId: notPurchasedProduct._id,
                rating: 5,
                comment: 'Trying to review without purchase'
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('You can only review products you have purchased.');
    });

    it('PATCH /:id/approve - should allow an admin to approve a review', async () => {
        // First, create a review
        const review = await Review.create({
            product: purchasedProduct._id,
            user: testUser._id,
            rating: 4,
            comment: 'Needs approval'
        });

        // Then, approve it as an admin
        const res = await request(app)
            .patch(`/api/v1/reviews/${review._id}/approve`)
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.data.review.isApproved).toBe(true);

        // Verify that the product's average rating was updated
        const product = await Product.findById(purchasedProduct._id);
        expect(product!.averageRating).toBe(4);
        expect(product!.numReviews).toBe(1);
    });
    
    it('PATCH /:id/approve - should NOT allow a regular user to approve a review', async () => {
        const review = await Review.create({
            product: purchasedProduct._id,
            user: testUser._id,
            rating: 4,
            comment: 'Needs approval'
        });

        const res = await request(app)
            .patch(`/api/v1/reviews/${review._id}/approve`)
            .set('Authorization', `Bearer ${userToken}`); // Using regular user token
        
        expect(res.statusCode).toBe(403); // Forbidden
    });
});