const User = require('../models/User');

// Get user's current credit balance (Unified system - uses User.credits)
const getCredits = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(`[CreditsController] getCredits called for user: ${userId}`);

    const user = await User.findById(userId);

    if (!user) {
      console.warn(`[CreditsController] User not found: ${userId}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`[CreditsController] Credits for ${user.email}: ${user.credits}`);

    res.json({
      success: true,
      credits: user.credits || 0,
      total_used: user.total_credits_purchased || 0
    });
  } catch (error) {
    console.error('[Credits] Error getting credits:', error);
    res.status(500).json({ success: false, message: 'Failed to get credits' });
  }
};

// Deduct 1 credit (internal use — called from other controllers, not exposed as route)
// NOTE: This function is kept for backward compatibility but now uses User model
const deductCredit = async (userId) => {
  const user = await User.findById(userId);
  if (!user || user.credits < 1) {
    throw new Error('INSUFFICIENT_CREDITS');
  }
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { credits: -1 } },
    { new: true }
  );
  return updatedUser.credits; // return remaining balance
};

module.exports = { getCredits, deductCredit };
