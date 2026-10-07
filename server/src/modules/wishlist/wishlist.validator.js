/**
 * Wishlist Validators
 * -------------------
 */

import { z } from 'zod';

const toggleWishlistSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
});

export {
  toggleWishlistSchema,
};
