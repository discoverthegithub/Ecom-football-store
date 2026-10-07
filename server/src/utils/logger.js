/**
 * Winston Logger
 * --------------
 * Centralized logging with Winston.
 * Logs to console (colorized) and daily rotating files.
 * All modules import this single logger instance.
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve log directory (relative to project root)
const LOG_DIR = path.resolve(__dirname, '..', '..', process.env.LOG_DIR || 'logs');

/**
 * Custom log format for file output.
 * Includes timestamp, level, message, and any metadata.
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Custom log format for console output.
 * Colorized and human-readable for development.
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} ${level}: ${stack || message}${metaStr}`;
  })
);

/**
 * Daily rotating file transport — error logs.
 * Separate file for easier error monitoring.
 */
const errorRotateTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true,
  format: fileFormat,
});

/**
 * Daily rotating file transport — combined logs (all levels).
 */
const combinedRotateTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
  format: fileFormat,
});

/**
 * Console transport — used in all environments.
 */
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

/**
 * Create the logger instance.
 * Level is controlled by LOG_LEVEL env var.
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  defaultMeta: { service: process.env.APP_NAME || 'MT-Ecommerce' },
  transports: [consoleTransport, combinedRotateTransport, errorRotateTransport],
  // Prevent unhandled exceptions from crashing silently
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }),
  ],
  exitOnError: false,
});

export default logger;
