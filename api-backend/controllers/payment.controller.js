const axios = require('axios');
const { JWT } = require('google-auth-library');
const User = require('../models/User');

const CREDIT_PACKAGES = {
  cosmic_starter: { credits: 50, name: 'Cosmic Starter', is_subscription: true },
  cosmic_explorer: { credits: 180, name: 'Cosmic Explorer', is_subscription: true },
  cosmic_sage: { credits: 450, name: 'Cosmic Sage', is_subscription: true },
  starter: { credits: 50, name: 'Cosmic Starter', is_subscription: true },
  explorer: { credits: 180, name: 'Cosmic Explorer', is_subscription: true },
  sage: { credits: 450, name: 'Cosmic Sage', is_subscription: true }
};

// Helper for Apple App Store receipt validation
async function validateAppleReceipt(receipt, sharedSecret) {
  const payload = {
    'receipt-data': receipt,
    ...(sharedSecret && { 'password': sharedSecret })
  };

  try {
    const prodRes = await axios.post('https://buy.itunes.apple.com/verifyReceipt', payload, { timeout: 15000 });
    if (prodRes.data?.status === 21007) {
      const sandboxRes = await axios.post('https://sandbox.itunes.apple.com/verifyReceipt', payload, { timeout: 15000 });
      return sandboxRes.data;
    }
    return prodRes.data;
  } catch (error) {
    try {
      const sandboxRes = await axios.post('https://sandbox.itunes.apple.com/verifyReceipt', payload, { timeout: 15000 });
      return sandboxRes.data;
    } catch (sandboxError) {
      throw new Error(`Apple receipt validation request failed: ${error.message}`);
    }
  }
}

// Helper for Google Play receipt validation
async function validateGooglePurchase({ packageName, productId, token, isSubscription }) {
  const serviceAccountJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('Google Play Service Account JSON not configured');
  }

  let credentials;
  try {
    credentials = JSON.parse(serviceAccountJson.trim());
  } catch (e) {
    const fs = require('fs');
    credentials = JSON.parse(fs.readFileSync(serviceAccountJson.trim(), 'utf8'));
  }

  const jwtClient = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  await jwtClient.authorize();

  const endpointType = isSubscription ? 'subscriptions' : 'products';
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/${endpointType}/${productId}/tokens/${token}`;

  const response = await jwtClient.request({ url });
  return response.data;
}

const verifyIAP = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { platform, productId, transactionId, receipt, purchaseToken } = req.body;

    if (!platform || !productId || (!receipt && !purchaseToken)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required In-App Purchase parameters.'
      });
    }

    const packageConfig = CREDIT_PACKAGES[productId];
    if (!packageConfig) {
      return res.status(400).json({
        success: false,
        message: `Invalid product ID: ${productId}`
      });
    }

    const paymentId = transactionId || purchaseToken || `iap_${Date.now()}`;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.processed_payments && user.processed_payments.includes(paymentId)) {
      console.log(`[Payment] IAP ${paymentId} already processed for user ${userId}`);
      return res.json({
        success: true,
        message: 'Purchase already processed. Credits were already added.',
        credits_added: 0,
        new_balance: user.credits,
        package: productId
      });
    }

    let validationResult = null;
    let isValid = false;

    if (platform === 'ios') {
      const appleSecret = process.env.APPLE_IAP_SHARED_SECRET ? process.env.APPLE_IAP_SHARED_SECRET.trim() : null;
      if (!appleSecret && process.env.NODE_ENV === 'development') {
        console.warn(`[Payment] APPLE_IAP_SHARED_SECRET not set. Allowing mock verification for development.`);
        isValid = true;
        validationResult = { mock: true };
      } else {
        console.log(`[Payment] Verifying iOS receipt with Apple...`);
        validationResult = await validateAppleReceipt(receipt, appleSecret);
        if (validationResult && validationResult.status === 0) {
          isValid = true;
        } else {
          console.error('[Payment] Apple receipt validation failed. Response:', validationResult);
        }
      }
    } else if (platform === 'android') {
      const googleServiceJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
      if (!googleServiceJson && process.env.NODE_ENV === 'development') {
        console.warn(`[Payment] GOOGLE_PLAY_SERVICE_ACCOUNT_JSON not set. Allowing mock verification for development.`);
        isValid = true;
        validationResult = { mock: true };
      } else {
        console.log(`[Payment] Verifying Android purchase token with Google Play...`);
        const packageName = process.env.ANDROID_PACKAGE_NAME || 'com.astroai4u.app';
        try {
          validationResult = await validateGooglePurchase({
            packageName,
            productId,
            token: purchaseToken || receipt,
            isSubscription: packageConfig.is_subscription
          });
          isValid = true;
        } catch (err) {
          try {
            validationResult = await validateGooglePurchase({
              packageName,
              productId,
              token: purchaseToken || receipt,
              isSubscription: false
            });
            isValid = true;
          } catch (productErr) {
            console.error('[Payment] Google purchase validation failed:', err.message, productErr.message);
          }
        }
      }
    } else {
      return res.status(400).json({ success: false, message: `Unsupported platform: ${platform}` });
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'In-app purchase receipt or token verification failed.'
      });
    }

    const updateObj = {
      $inc: { 
        credits: packageConfig.credits,
        total_credits_purchased: packageConfig.credits
      },
      $addToSet: { processed_payments: paymentId },
      subscription_plan: productId,
      subscription_status: 'active',
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateObj, { new: true });
    console.log(`[Payment] Native IAP successful. Added ${packageConfig.credits} credits to ${userId}. New balance: ${updatedUser.credits}`);

    return res.json({
      success: true,
      message: `Successfully processed purchase! ${packageConfig.credits} credits added to your celestial balance.`,
      credits_added: packageConfig.credits,
      new_balance: updatedUser.credits,
      package: productId
    });

  } catch (err) {
    console.error('[Payment] Error in verifyIAP:', err);
    next(err);
  }
};

const getPaymentStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('credits total_credits_purchased');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
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

module.exports = { verifyIAP, getPaymentStatus };
