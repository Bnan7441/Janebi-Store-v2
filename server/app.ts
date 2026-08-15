import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino-http';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler.js';
import { env } from './env.js';

import productsRoutes from './routes/products.js';
import categoriesRoutes from './routes/categories.js';
import brandsRoutes from './routes/brands.js';
import couponsRoutes from './routes/coupons.js';
import ordersRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import cartRoutes from './routes/cart.js';
import wishlistRoutes from './routes/wishlist.js';
import contactRoutes from './routes/contact.js';
import paymentRoutes from './routes/payment.js';
import adminRoutes from './routes/admin.js';

export const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json());
app.use(pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: () => process.env.NODE_ENV === 'test' || env.NODE_ENV === 'test',
});
app.use('/api/', limiter);

// Routes
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);
