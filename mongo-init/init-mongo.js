// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Wait for MongoDB to be ready
print('Starting MongoDB initialization...');

// Switch to admin database
db = db.getSiblingDB('admin');

// Create the application database user
db.createUser({
  user: process.env.MONGO_USERNAME,
  pwd: process.env.MONGO_PASSWORD,
  roles: [
    {
      role: "readWrite",
      db: process.env.MONGO_DATABASE
    }
  ]
});

// Switch to the application database
db = db.getSiblingDB(process.env.MONGO_DATABASE);

// Create collections if they don't exist
db.createCollection('users');
db.createCollection('products');
db.createCollection('categories');
db.createCollection('orders');
db.createCollection('reviews');
db.createCollection('carts');
db.createCollection('wishlists');
db.createCollection('subscribers');

print('MongoDB initialization completed successfully!');
print('Database: ' + process.env.MONGO_DATABASE);
print('User: ' + process.env.MONGO_USERNAME);
