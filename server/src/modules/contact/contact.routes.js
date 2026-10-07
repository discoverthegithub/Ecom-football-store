/**
 * Contact Routes
 * --------------
 * Endpoints for submitting and managing contact form inquiries.
 */

import { Router } from 'express';
import contactController from './contact.controller.js';
import authenticate from '../../middlewares/auth.middleware.js';
import authorize from '../../middlewares/authorize.middleware.js';
import { USER_ROLES } from '../../utils/constants.js';

const router = Router();

// Public: Submit contact form message
router.post('/', contactController.createMessage);

// Admin protected routes
router.use(authenticate);
router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.get('/', contactController.getAllMessages);
router.patch('/:id/read', contactController.markAsRead);
router.delete('/:id', contactController.deleteMessage);

export default router;
