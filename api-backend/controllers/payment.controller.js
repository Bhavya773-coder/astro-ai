const crypto = require('crypto');
const Razorpay = require('razorpay');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Credit Packages
const CREDIT_PACKAGES = {
  pro: { amount: 9900, currency: 'INR', credits: 100, name: 'Pro Pack' },      // ?99 = 100 credits
  ultra: { amount: 19900, currency: 'INR', credits: 300, name: 'Ultra Pack' }  // ?199 = 300 credits
};

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { plan } = req.body;

    if (!CREDIT_PACKAGES[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan. Choose pro (100 credits) or ultra (300 credits).'
      });
    }

    // Check if Razorpay credentials are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('[Payment] Razorpay credentials not configured');
      return res.status(500).json({
        success: false,
        message: 'Payment service not configured. Please contact support.'
      });
    }

    const packageConfig = CREDIT_PACKAGES[plan];
    // Receipt must be max 40 chars
    const shortUserId = userId.slice(-6);
    const timestamp = Date.now().toString().slice(-6);
    const receipt = `r_${shortUserId}_${plan}_${timestamp}`;

    console.log(`[Payment] Creating order for user ${userId}, plan ${plan}`);

    const order = await razorpay.orders.create({
      amount: packageConfig.amount,
      currency: packageConfig.currency,
      receipt: receipt,
      notes: {
        userId: userId,
        plan: plan,
        credits: packageConfig.credits
      }
    });

    console.log(`[Payment] Order created: ${order.id}`);

    return res.json({
      success: true,
      order: order,
      key_id: process.env.RAZORPAY_KEY_ID,
      credits: packageConfig.credits
    });
  } catch (err) {
    console.error('[Payment] Error creating order:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order. Please try again.'
    });
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    // Compute expected signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    const packageConfig = CREDIT_PACKAGES[plan];
    if (!packageConfig) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credit package'
      });
    }

    // Check if payment already processed (prevent duplicate credits)
    const user = await User.findById(userId);
    if (user.processed_payments && user.processed_payments.includes(razorpay_payment_id)) {
      console.log(`[Payment] Payment ${razorpay_payment_id} already processed for user ${userId}`);
      return res.json({
        success: true,
        message: 'Payment already processed. Credits were already added.',
        credits_added: 0,
        new_balance: user.credits,
        package: plan
      });
    }

    // Add credits and track processed payment
    const updatedUser = await User.findByIdAndUpdate(userId, {
      $inc: { 
        credits: packageConfig.credits,
        total_credits_purchased: packageConfig.credits
      },
      $addToSet: { processed_payments: razorpay_payment_id },
      razorpay_payment_id: razorpay_payment_id
    }, { new: true });

    console.log(`[Payment] Credits added: ${packageConfig.credits} to user ${userId}. New balance: ${updatedUser.credits}`);

    return res.json({
      success: true,
      message: `${packageConfig.credits} credits added to your account!`,
      credits_added: packageConfig.credits,
      new_balance: updatedUser.credits,
      package: plan
    });
  } catch (err) {
    console.error('[Payment] Error in verifyPayment:', err);
    next(err);
  }
};

const handleWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body;

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const { notes } = payment;
      const userId = notes?.userId;
      const plan = notes?.plan;
      const credits = notes?.credits;
      const paymentId = payment.id;

      if (userId && plan && credits) {
        // Check if payment already processed
        const user = await User.findById(userId);
        if (user?.processed_payments?.includes(paymentId)) {
          console.log(`[Webhook] Payment ${paymentId} already processed for user ${userId}`);
          return res.json({ success: true, message: 'Payment already processed' });
        }

        await User.findByIdAndUpdate(userId, {
          $inc: { 
            credits: credits,
            total_credits_purchased: credits
          },
          $addToSet: { processed_payments: paymentId },
          razorpay_payment_id: paymentId
        });
        console.log(`[Webhook] Credits added: ${credits} to user ${userId} for payment ${paymentId}`);
      }
    }

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const getPaymentStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('credits total_credits_purchased');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      credits: {
        current: user.credits,
        total_purchased: user.total_credits_purchased
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, verifyPayment, handleWebhook, getPaymentStatus };
