import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import AppError from './utils/appError.js';

// Import all routers
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import categoryRouter from './routes/category.routes.js';
import productRouter from './routes/product.routes.js';
import cartRouter from './routes/cart.routes.js';
import orderRouter from './routes/order.routes.js';
import reviewRouter from './routes/review.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
import newsletterRouter from './routes/newsletter.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';

const app = express();

// --- GLOBAL MIDDLEWARES ---

// More explicit CORS Configuration to handle preflight requests and Authorization headers
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type,Authorization', // Explicitly allow Authorization header
};
app.use(cors(corsOptions));

// Body Parser
app.use(bodyParser.json({ limit: '10kb' }));

// Data Sanitization
app.use(mongoSanitize());
app.use(xss());

// Rate Limiter
const limiter = rateLimit({
    max: 500, // Increased limit for development
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);


// --- ROUTES ---
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/newsletter', newsletterRouter);
app.use('/api/v1/wishlist', wishlistRouter);


// Handle undefined routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let error = { ...err };
  error.message = err.message;
  if (error.code === 11000) {
    const message = `Duplicate field value entered.`;
    error = new AppError(message, 400);
  }
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    errors: error.errors
  });
});

export default app;
