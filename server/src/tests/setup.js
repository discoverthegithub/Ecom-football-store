/**
 * Jest Test Setup
 * ----------------
 * Runs before each test suite.
 * Sets up environment variables and any shared test fixtures.
 */

// Force test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.MONGO_URI = 'mongodb://localhost:27017/mt-ecommerce-test';
process.env.REDIS_HOST = '127.0.0.1';
process.env.REDIS_PORT = '6379';
process.env.REDIS_PASSWORD = '';
process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.COOKIE_SECRET = 'test_cookie_secret';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.API_VERSION = 'v1';
process.env.APP_NAME = 'MT-Ecommerce-Test';
process.env.LOG_LEVEL = 'error'; // Suppress logs during tests
process.env.LOG_DIR = 'logs';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '1000';
