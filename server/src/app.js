/**
 * Express Application Setup
 * --------------------------
 * Configures the Express app with all global middleware, security headers,
 * API versioning, and error handling.
 *
 * Middleware Order (important):
 *   1. Security headers (Helmet)
 *   2. CORS
 *   3. Request logging
 *   4. Rate limiting
 *   5. Body parsing
 *   6. Cookie parsing
 *   7. Input sanitization
 *   8. HPP (HTTP Parameter Pollution)
 *   9. Compression
 *  10. API routes
 *  11. 404 handler
 *  12. Global error handler
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import passport from 'passport';

import env from './config/env.config.js';
import requestLogger from './middlewares/requestLogger.middleware.js';
import { globalLimiter } from './middlewares/rateLimiter.middleware.js';
import { mongoSanitizer, xssSanitizer } from './middlewares/sanitize.middleware.js';
import errorHandler from './middlewares/error.middleware.js';
import ApiError from './utils/ApiError.js';
import ApiResponse from './utils/ApiResponse.js';
import configurePassport from './config/passport.config.js';

// ── Module Routes ──
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import productRoutes from './modules/products/product.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import orderRoutes from './modules/orders/order.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import paymentController from './modules/payments/payment.controller.js';
import reviewRoutes from './modules/reviews/review.routes.js';
import wishlistRoutes from './modules/wishlist/wishlist.routes.js';
import couponRoutes from './modules/coupons/coupon.routes.js';
import dashboardRoutes from './modules/admin/dashboard.routes.js';
import contactRoutes from './modules/contact/contact.routes.js';

const app = express();

// ──────────────────────────────────────────
// 1. Security Headers
// ──────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  })
);

// ──────────────────────────────────────────
// 2. CORS
// ──────────────────────────────────────────
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ──────────────────────────────────────────
// 3. Request Logging
// ──────────────────────────────────────────
app.use(requestLogger);

// ──────────────────────────────────────────
// 4. Rate Limiting
// ──────────────────────────────────────────
app.use(`/api/${env.API_VERSION}`, globalLimiter);

// ──────────────────────────────────────────
// 4b. Stripe Webhook (Must be before body parsers)
// ──────────────────────────────────────────
app.post(
  `/api/${env.API_VERSION}/payments/webhook`,
  express.raw({ type: 'application/json' }),
  paymentController.webhook
);

// ──────────────────────────────────────────
// 5. Body Parsing
// ──────────────────────────────────────────
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ──────────────────────────────────────────
// 6. Cookie Parsing
// ──────────────────────────────────────────
app.use(cookieParser(env.COOKIE_SECRET));

// ──────────────────────────────────────────
// 7. Input Sanitization
// ──────────────────────────────────────────
app.use(mongoSanitizer);
app.use(xssSanitizer);

// ──────────────────────────────────────────
// 8. HTTP Parameter Pollution Protection
// ──────────────────────────────────────────
app.use(
  hpp({
    whitelist: ['price', 'rating', 'category', 'size', 'color', 'sort'],
  })
);

// ──────────────────────────────────────────
// 9. Response Compression
// ──────────────────────────────────────────
app.use(compression());

// ──────────────────────────────────────────
// 9b. Passport Initialization (for Google OAuth)
// ──────────────────────────────────────────
configurePassport();
app.use(passport.initialize());

// ──────────────────────────────────────────
// 10. Health Check (before auth, publicly accessible)
// ──────────────────────────────────────────
app.get(`/api/${env.API_VERSION}/health`, (req, res) => {
  ApiResponse.ok(res, {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  }, 'Server is running');
});

// ──────────────────────────────────────────
// 11. API Routes
// ──────────────────────────────────────────
app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}/users`, userRoutes);
app.use(`/api/${env.API_VERSION}/categories`, categoryRoutes);
app.use(`/api/${env.API_VERSION}/products`, productRoutes);
app.use(`/api/${env.API_VERSION}/cart`, cartRoutes);
app.use(`/api/${env.API_VERSION}/orders`, orderRoutes);
app.use(`/api/${env.API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${env.API_VERSION}/reviews`, reviewRoutes);
app.use(`/api/${env.API_VERSION}/wishlist`, wishlistRoutes);
app.use(`/api/${env.API_VERSION}/coupons`, couponRoutes);
app.use(`/api/${env.API_VERSION}/admin`, dashboardRoutes);
app.use(`/api/${env.API_VERSION}/contact`, contactRoutes);

// ──────────────────────────────────────────
// 12. 404 Handler — Undefined Routes
// ──────────────────────────────────────────
app.all('*', (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// ──────────────────────────────────────────
// 13. Global Error Handler (MUST be last)
// ──────────────────────────────────────────
app.use(errorHandler);

export default app;
