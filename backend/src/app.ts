import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import path from 'path';
import AppError from './utils/appError.js';

// Routers
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

/* ----------------------------- Security/CORS ----------------------------- */
// Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow all origins
  credentials: false, // Disable credentials for wildcard origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
});

// Rate limit (generic). İstersen /auth/login için ayrı limiter ekleyebilirsin.
const apiLimiter = rateLimit({
  max: 1000,
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Body parsers
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Sanitization & XSS
app.use(mongoSanitize());
app.use(xss());

/* --------------------------- Static file serving -------------------------- */
/**
 * Multer dosyaları "public/uploads" altına atıyor.
 * Aşağıdaki iki mount sayesinde bu dosyalara hem "/public/*"
 * hem de "/api/v1/public/*" yolu ile erişilebilir.
 *
 * Böylece frontend’te:
 * `${NEXT_PUBLIC_API_URL}${product.images[0]}`
 * ve product.images[0] == "/public/uploads/xxx.jpg"
 * ile istek attığında (NEXT_PUBLIC_API_URL = ".../api/v1")
 * URL -> ".../api/v1/public/uploads/xxx.jpg" olur ve çalışır.
 */
const PUBLIC_DIR = path.join(process.cwd(), 'public');
app.use('/public', express.static(PUBLIC_DIR));
app.use('/api/v1/public', express.static(PUBLIC_DIR));

/* --------------------------------- Routes -------------------------------- */
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

/* --------------------------------- Health -------------------------------- */
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

/* ------------------------------ 404 handler ------------------------------ */
app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

/* ----------------------------- Global errors ----------------------------- */
// Basit error handler; projendeki mevcut error middleware’in varsa onu kullan.
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const message = err.message || 'Something went wrong';
  res.status(statusCode).json({ status, message });
});

export default app;