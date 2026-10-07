/**
 * Contact Controller
 * ------------------
 * Handles incoming contact message HTTP requests.
 */

import contactService from './contact.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

class ContactController {
  async createMessage(req, res, next) {
    try {
      const message = await contactService.createMessage(req.body);
      return ApiResponse.created(res, message, 'Message dispatched to Dugout support successfully.');
    } catch (error) {
      next(error);
    }
  }

  async getAllMessages(req, res, next) {
    try {
      const result = await contactService.getAllMessages(req.query);
      return ApiResponse.ok(res, result, 'Contact messages retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const message = await contactService.markAsRead(req.params.id);
      return ApiResponse.ok(res, message, 'Contact message marked as read');
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req, res, next) {
    try {
      await contactService.deleteMessage(req.params.id);
      return ApiResponse.ok(res, null, 'Contact message deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ContactController();
