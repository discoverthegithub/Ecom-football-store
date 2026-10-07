/**
 * Payment Controller
 * -------------------
 */

import paymentService from './payment.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

class PaymentController {
  createIntent = asyncHandler(async (req, res) => {
    const { clientSecret } = await paymentService.createPaymentIntent(
      req.params.orderId,
      req.user._id
    );

    ApiResponse.ok(res, { clientSecret }, 'Payment intent created successfully');
  });

  // Note: We don't use asyncHandler here because Stripe handles its own errors
  // and we want raw control over the response to Stripe
  webhook = async (req, res) => {
    const signature = req.headers['stripe-signature'];

    try {
      // req.body MUST be raw for Stripe signature verification to work
      await paymentService.handleWebhook(req.body, signature);
      res.json({ received: true });
    } catch (error) {
      // Return 400 to Stripe if verification fails
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  };
}

export default new PaymentController();
