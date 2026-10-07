/**
 * Payment Service (Stripe Integration)
 * --------------------------------------
 */

import Stripe from 'stripe';
import env from '../../config/env.config.js';
import orderRepository from '../orders/order.repository.js';
import Payment from './payment.model.js';
import ApiError from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';
import { PAYMENT_STATUSES, ORDER_STATUSES } from '../../utils/constants.js';

// Initialize Stripe (if secret key exists)
const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
}) : null;

class PaymentService {
  /**
   * Create a Stripe PaymentIntent for a specific order.
   */
  async createPaymentIntent(orderId, userId) {
    const order = await orderRepository.findOrderById(orderId);
    
    if (!order) {
      throw ApiError.notFound('Order not found.');
    }

    // Verify ownership
    if (order.user._id.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to pay for this order.');
    }

    const total = order.total !== undefined ? order.total : (order.subtotal || 100);

    if (!stripe) {
      logger.info(`ℹ️ Stripe not configured. Using demo payment intent for Order: ${orderId}`);
      return {
        clientSecret: `mock_client_secret_${order._id}_${Date.now()}`,
      };
    }

    // Check if already paid
    const existingPayment = await Payment.findOne({ order: orderId });
    if (existingPayment?.status === PAYMENT_STATUSES.PAID) {
      throw ApiError.badRequest('This order has already been paid.');
    }

    // Amount must be in cents for Stripe
    const amountInCents = Math.round(total * 100);

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString(),
      },
    });

    // Update the Payment record with the Stripe Intent ID
    if (existingPayment) {
      existingPayment.stripePaymentIntentId = paymentIntent.id;
      await existingPayment.save();
    }

    // Return the client secret so the frontend can securely complete the payment
    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  /**
   * Handle incoming Stripe Webhooks
   */
  async handleWebhook(rawBody, signature) {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
      throw ApiError.internal('Stripe webhook secret is not configured.');
    }

    let event;

    try {
      // Verify the webhook signature securely
      event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      logger.error(`❌ Stripe Webhook Signature Verification Failed: ${err.message}`);
      throw ApiError.badRequest(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await this._processSuccessfulPayment(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object;
        await this._processFailedPayment(failedIntent);
        break;
      }

      default:
        // Unhandled event type
        logger.info(`ℹ️ Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Process successful payment: update Payment and Order statuses.
   */
  async _processSuccessfulPayment(paymentIntent) {
    const { orderId } = paymentIntent.metadata;
    if (!orderId) {return;}

    logger.info(`✅ Payment succeeded for Order: ${orderId}`);

    // Update Payment record
    await Payment.findOneAndUpdate(
      { order: orderId },
      { 
        status: PAYMENT_STATUSES.PAID,
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntent.id
      }
    );

    // Update Order record (moving from PENDING to PROCESSING)
    await orderRepository.updateOrder(orderId, {
      status: ORDER_STATUSES.PROCESSING,
    });
  }

  /**
   * Process failed payment: log the failure reason.
   */
  async _processFailedPayment(paymentIntent) {
    const { orderId } = paymentIntent.metadata;
    if (!orderId) {return;}

    logger.warn(`❌ Payment failed for Order: ${orderId}. Reason: ${paymentIntent.last_payment_error?.message}`);

    await Payment.findOneAndUpdate(
      { order: orderId },
      { 
        status: PAYMENT_STATUSES.FAILED,
        failureReason: paymentIntent.last_payment_error?.message || 'Unknown error'
      }
    );
  }
}

export default new PaymentService();
