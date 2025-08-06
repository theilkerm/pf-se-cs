import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import AppError from './utils/appError.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import categoryRouter from './routes/category.routes.js';
import productRouter from './routes/product.routes.js';
import cartRouter from './routes/cart.routes.js';
import orderRouter from './routes/order.routes.js';
import reviewRouter from './routes/review.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';

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
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/dashboard', dashboardRouter);

// Handle all other undefined routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// --- GLOBAL ERROR HANDLING MIDDLEWARE ---
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;

  // Handle Mongoose duplicate key error (code 11000)
  if (error.code === 11000) {
    const message = `Duplicate field value entered, please use another value.`;
    error = new AppError(message, 400);
  }

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message
  });
});

export default app;