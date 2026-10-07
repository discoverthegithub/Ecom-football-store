/**
 * Form Data Parser Middleware
 * ----------------------------
 * Express middleware to clean up messy form-data parsing logic from controllers.
 * 
 * multipart/form-data requests (like file uploads) stringify all text fields.
 * This middleware automatically converts fields like "true" to boolean `true`,
 * and parses JSON stringified arrays back into real JavaScript arrays/objects.
 */

export const parseFormData = (req, res, next) => {
  if (!req.body) return next();

  // 1. Convert stringified booleans back to true booleans
  Object.keys(req.body).forEach(key => {
    if (req.body[key] === 'true') req.body[key] = true;
    if (req.body[key] === 'false') req.body[key] = false;
    
    // 2. Try to parse JSON strings (like stringified arrays or objects)
    // Only attempt if it looks like a JSON array or object
    if (typeof req.body[key] === 'string' && (req.body[key].startsWith('[') || req.body[key].startsWith('{'))) {
      try {
        req.body[key] = JSON.parse(req.body[key]);
      } catch (error) {
        // If it fails to parse, just leave it as a string
      }
    }
  });

  next();
};

export default parseFormData;
