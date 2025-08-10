import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

// Import Models
import User from '../models/user.model.js';
import Product, { IVariant } from '../models/product.model.js';
import Category from '../models/category.model.js';
import Review from '../models/review.model.js';
import Order from '../models/order.model.js';

dotenv.config({ path: './.env' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const importData = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error('MONGO_URI is not defined. Check your .env file and package.json scripts.');
        }
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connection successful. Clearing old data...');

        // Clear existing data
        await Order.deleteMany();
        await Review.deleteMany();
        await Product.deleteMany();
        await Category.deleteMany();
        await User.deleteMany();
        
        console.log('Old data cleared.');

        // --- Create Users ---
        const userCreationPromises = [];
        userCreationPromises.push(User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin',
            isEmailVerified: true,
        }));
        
        userCreationPromises.push(User.create({
            firstName: 'İlker',
            lastName: 'Mustafa',
            email: 'ilker@example.com',
            password: 'password123',
            role: 'customer',
            isEmailVerified: true,
            addresses: [{
                street: '123 FSM Bulvarı',
                city: 'Bursa',
                state: 'Nilüfer',
                zipCode: '16110',
                country: 'Turkey'
            }]
        }));

        for (let i = 0; i < 18; i++) {
            userCreationPromises.push(User.create({
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: faker.internet.email().toLowerCase(),
                password: 'password123',
                role: 'customer',
                isEmailVerified: true,
            }));
        }
        const createdUsers = await Promise.all(userCreationPromises);
        console.log(`${createdUsers.length} users created successfully.`);


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
        console.log(`${createdCategories.length} categories created.`);


        // --- Create Products ---
        const products = [];
        const allTags = ['best-seller', 'new-arrival', 'eco-friendly', 'sale', 'premium', 'limited-edition'];
        for (let i = 0; i < 100; i++) {
            const randomCategory = faker.helpers.arrayElement(createdCategories);
            const variants: IVariant[] = [];

            if (randomCategory.name === 'Clothing') {
                const sizes = ['S', 'M', 'L', 'XL'];
                faker.helpers.arrayElements(sizes, { min: 2, max: 4 }).forEach(size => {
                    variants.push({ type: 'Size', value: size, stock: faker.number.int({ min: 0, max: 50 }) });
                });
            } else if (randomCategory.name === 'Electronics') {
                const colors = ['Black', 'White', 'Silver', 'Space Gray'];
                faker.helpers.arrayElements(colors, { min: 1, max: 3 }).forEach(color => {
                    variants.push({ type: 'Color', value: color, stock: faker.number.int({ min: 10, max: 100 }) });
                });
            }

            products.push({
                name: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                price: parseFloat(faker.commerce.price({ min: 10, max: 2000 })),
                category: randomCategory._id,
                images: [`/uploads/placeholder.jpg`],
                variants: variants.length > 0 ? variants : [{ type: 'Default', value: 'Standard', stock: faker.number.int({ min: 0, max: 200 }) }],
                tags: faker.helpers.arrayElements(allTags, { min: 1, max: 3 }),
                isFeatured: Math.random() > 0.8 
            });
        }
        const createdProducts = await Product.insertMany(products);
        console.log(`${createdProducts.length} products created.`);
        
        
        // --- Create Reviews ---
        const reviews = [];
        const customerUsers = createdUsers.filter(u => u.role === 'customer');
        for (const product of createdProducts) {
            const reviewCount = faker.number.int({ min: 0, max: 5 });
            for (let i = 0; i < reviewCount; i++) {
                const randomUser = faker.helpers.arrayElement(customerUsers);
                reviews.push({
                    comment: faker.lorem.sentence(),
                    rating: faker.number.int({ min: 1, max: 5 }),
                    product: product._id,
                    user: randomUser._id,
                });
            }
        }
        await Review.insertMany(reviews);
        console.log(`${reviews.length} reviews created.`);


        console.log('---------------------------');
        console.log('Data Imported Successfully!');
        console.log('---------------------------');

        process.exit();
    } catch (error) {
        console.error('Error with data import:', error);
        process.exit(1);
    }
};

const deleteData = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error('MONGO_URI is not defined.');
        }
        await mongoose.connect(MONGO_URI);

        await Order.deleteMany();
        await Review.deleteMany();
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