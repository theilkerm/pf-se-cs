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

        // --- Create Users ---
        // ... (Kullanıcı oluşturma kısmı aynı kalabilir)
        const users = [];
        users.push({
            firstName: 'Admin', lastName: 'User', email: 'admin@example.com', password: 'password123', role: 'admin', isEmailVerified: true,
        });
        for (let i = 0; i < 50; i++) {
            users.push({
                firstName: faker.person.firstName(), lastName: faker.person.lastName(), email: faker.internet.email().toLowerCase(), password: 'password123', role: 'customer', isEmailVerified: true,
            });
        }
        const createdUsers = await User.insertMany(users);
        console.log(`${createdUsers.length} users created...`);

        // --- Create Categories (with uniqueness check) ---
        const categorySet = new Set<string>();
        // Generate unique category names
        while (categorySet.size < 10) { // We want 10 unique categories
            categorySet.add(faker.commerce.department());
        }
        
        const categories = Array.from(categorySet).map(name => ({
            name: name,
            description: faker.lorem.sentence(),
        }));
        
        const createdCategories = await Category.insertMany(categories);
        console.log(`${createdCategories.length} categories created...`);

        // --- Create Products ---
        // ... (Ürün oluşturma kısmı aynı kalabilir)
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

// ... deleteData fonksiyonu aynı kalabilir ...
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