/**
 * Validation Middleware
 * ----------------------
 * Generic Zod validation middleware factory.
 * Validates request body, query, or params against a Zod schema.
 *
 * Usage in routes:
 *   router.post('/register', validate(registerSchema), authController.register);
 *   router.get('/products', validate(querySchema, 'query'), productController.getAll);
 */

import ApiError from '../utils/ApiError.js';

/**
 * Creates an Express middleware that validates request data against a Zod schema.
 *
 * @param {import('zod').ZodSchema} schema — Zod validation schema
 * @param {'body' | 'query' | 'params'} source — Which part of the request to validate
 * @returns {import('express').RequestHandler}
 */
const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      // Extract user-friendly error messages
      const errorMessages = errors.map((e) =>
        e.field ? `${e.field}: ${e.message}` : e.message
      );

      throw ApiError.unprocessable('Validation failed', errorMessages);
    }

    // Replace the source data with parsed/transformed data (strips unknown fields)
    req[source] = result.data;
    next();
  };
};

export default validate;
