import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.test' });

// --- Test Suite for Cart Routes ---
describe('Cart Routes - /api/v1/cart', () => {
    
    let userToken: string;
    let testProduct: any;
    let testUser: any;

    // --- Test Setup ---
    beforeAll(async () => {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) throw new Error('MONGO_URI not defined');
        await mongoose.connect(mongoUri);
    });

    // Before each test, create a fresh user and a product
    beforeEach(async () => {
        // Clear previous data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});

        // Create a user and log in to get a token
        testUser = await User.create({
            firstName: 'Cart',
            lastName: 'User',
            email: `cart-user-${Date.now()}@example.com`,
            password: 'password123',
        });
        const res = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: 'password123' });
        userToken = res.body.token;

        // Create a product to add to the cart
        const category = await Category.create({ name: 'Cart Test Category' });
        testProduct = await Product.create({
            name: 'Product for Cart',
            description: 'A product to test cart functionality',
            price: 50,
            category: category._id,
            stock: 10
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    // --- Test Cases ---
    
    it('POST / - should add a new item to the cart for a logged-in user', async () => {
        const res = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                productId: testProduct._id.toString(),
                quantity: 2
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.cart).toHaveLength(1);
        expect(res.body.data.cart[0].product.toString()).toBe(testProduct._id.toString());
        expect(res.body.data.cart[0].quantity).toBe(2);
    });
    
    it('POST / - should update the quantity if the same item is added again', async () => {
        // First, add the item with quantity 1
        await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ productId: testProduct._id, quantity: 1 });
        
        // Then, add the same item again with quantity 2
        const res = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ productId: testProduct._id, quantity: 2 });
        
        expect(res.statusCode).toBe(200);
        // The cart should still have only 1 item, but its quantity should be updated to 3 (1 + 2)
        expect(res.body.data.cart).toHaveLength(1);
        expect(res.body.data.cart[0].quantity).toBe(3);
    });

    it('GET / - should retrieve the cart for the logged-in user', async () => {
        // First, add an item to the cart
        await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ productId: testProduct._id, quantity: 3 });
        
        // Now, get the cart
        const res = await request(app)
            .get('/api/v1/cart')
            .set('Authorization', `Bearer ${userToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.data.cart).toHaveLength(1);
        expect(res.body.data.cart[0].quantity).toBe(3);
        // Check if product details are populated
        expect(res.body.data.cart[0].product.name).toBe('Product for Cart');
    });

    it('DELETE /:productId - should remove an item from the cart', async () => {
        // First, add an item
        await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ productId: testProduct._id, quantity: 1 });
            
        // Then, delete it
        const res = await request(app)
            .delete(`/api/v1/cart/${testProduct._id}`)
            .set('Authorization', `Bearer ${userToken}`);
        
        expect(res.statusCode).toBe(204);

        // Verify the cart is empty
        const userInDb = await User.findById(testUser._id);
        expect(userInDb!.cart).toHaveLength(0);
    });
    
    it('POST / - should fail if the user is not logged in', async () => {
        const res = await request(app)
            .post('/api/v1/cart')
            .send({ productId: testProduct._id, quantity: 1 });
        
        expect(res.statusCode).toBe(401); // Unauthorized
    });
});