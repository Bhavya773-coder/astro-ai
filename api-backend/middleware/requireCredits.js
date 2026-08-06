const User = require('../models/User');

const requireCredits = (cost = 1) => {
  return async (req, res, next) => {
    // Handle case where requireCredits is passed directly as middleware (req, res, next)
    let requiredAmount = 1;
    let actualReq = req;
    let actualRes = res;
    let actualNext = next;

    if (typeof cost === 'number') {
      requiredAmount = cost;
    } else if (cost && cost.user) {
      actualReq = cost;
      actualRes = res;
      actualNext = next;
    }

    try {
      const userId = actualReq.user.userId;
      console.log(`[requireCredits] Checking credits for user: ${userId}, required: ${requiredAmount}`);

      // Fetch user credits
      const user = await User.findById(userId).select('credits email');

      if (!user) {
        console.warn(`[requireCredits] User not found: ${userId}`);
        return actualRes.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log(`[requireCredits] User: ${user.email}, Credits: ${user.credits}, Required: ${requiredAmount}`);

      // Check if user has sufficient credits
      if (user.credits < requiredAmount) {
        console.warn(`[requireCredits] Insufficient credits for user: ${user.email} (Balance: ${user.credits}, Required: ${requiredAmount})`);
        return actualRes.status(403).json({
          success: false,
          message: `Insufficient credits. This feature requires ${requiredAmount} credit(s). Please purchase credits to continue.`,
          code: 'CREDITS_REQUIRED',
          current_credits: user.credits,
          required_credits: requiredAmount
        });
      }

      // Store credits info in request for later deduction
      actualReq.userCredits = user.credits;

      actualNext();
    } catch (err) {
      actualNext(err);
    }
  };
};

module.exports = { requireCredits };
