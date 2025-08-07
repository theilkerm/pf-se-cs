import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker'; // Import Faker

// Import Models
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI;

const importData = async () => {
    try {
        await mongoose.connect(MONGO_URI!);

        // Clear existing data
        await Product.deleteMany();
        await Category.deleteMany();
        await User.deleteMany();
        
        console.log('Old data cleared...');

        // --- Create Users (Corrected Method that triggers hooks) ---
        const userList = [];
        // Add one static admin user for easy login
        userList.push({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin',
            isEmailVerified: true,
        });
        // Generate 50 random customer users
        for (let i = 0; i < 50; i++) {
            userList.push({
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: faker.internet.email().toLowerCase(),
                password: 'password123',
                role: 'customer',
                isEmailVerified: true,
            });
        }
        
        // Using a loop with User.create for each individual user
        // This is the ONLY way to ensure pre('save') hooks run for each document.
        console.log('Creating users with hashed passwords...');
        for (const userData of userList) {
            await User.create(userData);
        }
        console.log(`${userList.length} users created successfully.`);


        // --- Create Categories ---
        const categorySet = new Set<string>();
        while (categorySet.size < 10) {
            categorySet.add(faker.commerce.department());
        }
        const categories = Array.from(categorySet).map(name => ({ name: name, description: faker.lorem.sentence() }));
        const createdCategories = await Category.insertMany(categories);
        console.log(`${createdCategories.length} categories created...`);

        // --- Create Products ---
        const products = [];
        for (let i = 0; i < 100; i++) {
            products.push({
                name: faker.commerce.productName(),
                description: faker.lorem.paragraphs(2),
                price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
                category: faker.helpers.arrayElement(createdCategories)._id,
                images: [`/images/product-${i+1}.jpg`],
                stock: faker.number.int({ min: 0, max: 200 }),
                isFeatured: faker.datatype.boolean(),
            });
        }
        const createdProducts = await Product.insertMany(products);
        console.log(`${createdProducts.length} products created...`);


        console.log('---------------------------');
        console.log('Data Imported Successfully!');
        console.log('---------------------------');
        console.log('Admin Login: admin@example.com');
        console.log('Password: password123');
        console.log('---------------------------');

        process.exit();
    } catch (error) {
        console.error('Error with data import:', error);
        process.exit(1);
    }
};

const deleteData = async () => {
    try {
        await mongoose.connect(MONGO_URI!);

        await Product.deleteMany();
        await Category.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error with data destruction:', error);
        process.exit(1);
    }
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
} else {
    console.log('Please specify --import or --delete flag.');
    process.exit(1);
}