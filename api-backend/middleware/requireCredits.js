const User = require('../models/User');

const requireCredits = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    console.log(`[requireCredits] Checking credits for user: ${userId}`);

    // Fetch user credits
    const user = await User.findById(userId).select('credits email');

    if (!user) {
      console.warn(`[requireCredits] User not found: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`[requireCredits] User: ${user.email}, Credits: ${user.credits}`);

    // Check if user has at least 1 credit
    if (user.credits < 1) {
      console.warn(`[requireCredits] Insufficient credits for user: ${user.email} (Balance: ${user.credits})`);
      return res.status(403).json({
        success: false,
        message: 'Insufficient credits. Please purchase credits to use this feature.',
        code: 'CREDITS_REQUIRED',
        current_credits: user.credits
      });
    }

    // Store credits info in request for later deduction
    req.userCredits = user.credits;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireCredits };
