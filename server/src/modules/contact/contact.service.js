/**
 * Contact Service
 * ---------------
 * Service methods for creating and managing contact messages.
 */

import ContactMessage from './contactMessage.model.js';
import ApiError from '../../utils/ApiError.js';

class ContactService {
  async createMessage(data) {
    const { name, email, phone, subject, message } = data;
    if (!name || !email || !message) {
      throw ApiError.badRequest('Name, email, and message are required.');
    }
    return ContactMessage.create({ name, email, phone, subject, message });
  }

  async getAllMessages(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (query.isRead !== undefined) {
      filter.isRead = query.isRead === 'true' || query.isRead === true;
    }

    const [messages, total] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ContactMessage.countDocuments(filter),
    ]);

    return {
      messages,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(id) {
    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!message) {
      throw ApiError.notFound('Contact message not found');
    }
    return message;
  }

  async deleteMessage(id) {
    const message = await ContactMessage.findByIdAndDelete(id);
    if (!message) {
      throw ApiError.notFound('Contact message not found');
    }
    return message;
  }
}

export default new ContactService();
