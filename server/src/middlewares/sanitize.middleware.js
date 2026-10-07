/**
 * Input Sanitization Middleware
 * ------------------------------
 * Protects against NoSQL injection and XSS attacks by sanitizing
 * request body, query params, and URL params.
 *
 * Uses:
 *   - express-mongo-sanitize: strips `$` and `.` from user input to prevent MongoDB injection
 *   - xss-clean: sanitizes HTML input to prevent cross-site scripting
 */

import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

/**
 * MongoDB injection protection.
 * Removes characters like `$` and `.` that could be used to manipulate queries.
 *
 * Example attack prevented:
 *   { "email": { "$gt": "" }, "password": { "$gt": "" } }
 */
const mongoSanitizer = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    // Optionally log sanitization events for audit
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(`[Sanitize] Key "${key}" was sanitized in ${req.originalUrl}`);
    }
  },
});

/**
 * XSS protection.
 * Sanitizes user input to prevent malicious script injection.
 *
 * Example attack prevented:
 *   { "name": "<script>alert('xss')</script>" }
 */
const xssSanitizer = xss();

export { mongoSanitizer, xssSanitizer };
