import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

// Import Models
import User from '../models/user.model.js';
import Product, { IVariant } from '../models/product.model.js';
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

        // --- Create Users ---
        const users = [];
        // Add one static admin user for easy login
        users.push({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin',
            isEmailVerified: true,
        });
        // Generate 20 random customer users
        for (let i = 0; i < 20; i++) {
            users.push({
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: faker.internet.email().toLowerCase(),
                password: 'password123',
                role: 'customer',
                isEmailVerified: true,
            });
        }
        // Use a loop with User.create to ensure pre('save') hooks run
        console.log('Creating users with hashed passwords...');
        for (const userData of users) {
            await User.create(userData);
        }
        console.log(`${users.length} users created successfully.`);


        // --- Create the 8 specific categories from the document ---
        const specificCategories = [
            { name: 'Electronics', description: 'Gadgets and devices' },
            { name: 'Clothing', description: 'Apparel and accessories' },
            { name: 'Home and Garden', description: 'Items for your home and garden' },
            { name: 'Sports', description: 'Sporting goods and equipment' },
            { name: 'Books', description: 'Printed and digital books' },
            { name: 'Health and Beauty', description: 'Personal care and beauty products' },
            { name: 'Toys', description: 'Toys and games for all ages' },
            { name: 'Food', description: 'Groceries and specialty foods' },
        ];
        const createdCategories = await Category.insertMany(specificCategories);
        console.log(`${createdCategories.length} categories created...`);


        // --- Create Products with Variants ---
        const products = [];
        for (let i = 0; i < 100; i++) {
            const randomCategory = faker.helpers.arrayElement(createdCategories);
            let variants: IVariant[] = [];

            if (randomCategory.name === 'Clothing') {
                const sizes = ['S', 'M', 'L', 'XL'];
                const selectedSizes = faker.helpers.arrayElements(sizes, faker.number.int({ min: 2, max: 4 }));
                selectedSizes.forEach(size => variants.push({ type: 'Size', value: size, stock: faker.number.int({ min: 5, max: 50 }) }));
                variants.push({ type: 'Color', value: faker.color.human(), stock: faker.number.int({ min: 5, max: 50 }) });
            } else if (randomCategory.name === 'Electronics') {
                const colors = ['Black', 'White', 'Silver', 'Space Gray'];
                const selectedColors = faker.helpers.arrayElements(colors, faker.number.int({ min: 2, max: 3 }));
                selectedColors.forEach(color => {
                    variants.push({ type: 'Color', value: color, stock: faker.number.int({ min: 10, max: 100 }) });
                });
            }

            products.push({
                name: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                price: parseFloat(faker.commerce.price({ min: 10, max: 2000 })),
                category: randomCategory._id,
                images: [`/uploads/placeholder.jpg`],
                variants: variants.length > 0 ? variants : [{ type: 'Default', value: 'Standard', stock: faker.number.int({ min: 0, max: 200 }) }]
            });
        }
        await Product.insertMany(products);
        console.log(`${products.length} products with variants created...`);
        
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

// Check for command line arguments to decide which function to run
if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
} else {
    console.log('Please specify --import or --delete flag.');
    process.exit(1);
}