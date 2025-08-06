import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import AppError from './utils/appError.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import categoryRouter from './routes/category.routes.js';
import productRouter from './routes/product.routes.js';
import cartRouter from './routes/cart.routes.js';
import orderRouter from './routes/order.routes.js';

// Load environment variables
dotenv.config({ path: './.env' }); // Explicitly define path

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Body parser

// --- ROUTES ---
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the E-commerce API!');
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);

// Handle all other undefined routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// --- GLOBAL ERROR HANDLING MIDDLEWARE ---
app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    // For development, you might want to see the stack trace
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    // error: err
  });
});


// Environment variables
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

// Function to connect to DB and start the server
const startServer = async () => {
  if (!MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to MongoDB.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

startServer();