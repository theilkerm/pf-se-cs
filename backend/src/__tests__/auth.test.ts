import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.test' });

// --- Database Hooks ---
beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not defined in .env.test');
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.connection.close();
});

// Using a describe block for better organization
describe('Auth Routes - /api/v1/auth', () => {
    
    // Clear users before each test to ensure isolation
    beforeEach(async () => {
        await User.deleteMany({});
    });

    it('should register a new user successfully with valid data', async () => {
        const uniqueEmail = `test-${Date.now()}@example.com`;
        const userData = {
            firstName: 'Test',
            lastName: 'User',
            email: uniqueEmail,
            password: 'password123'
        };

        const res = await request(app)
            .post('/api/v1/auth/register')
            .send(userData);

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.token).toBeDefined();
        expect(res.body.data.user.email).toBe(userData.email);
    });

    it('should fail to register a user with an already existing email', async () => {
        const uniqueEmail = `test-${Date.now()}@example.com`;
        const userData = {
            firstName: 'Test',
            lastName: 'User',
            email: uniqueEmail,
            password: 'password123'
        };
        
        // First, create the user
        await User.create(userData);

        // Then, try to register again with the same exact data
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send(userData);

        // Now it should correctly return a 400 error
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('Duplicate field value');
    });
});