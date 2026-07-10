const Visitor = require('../models/Visitor');

const trackVisitor = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const path = req.originalUrl;
    const referrer = req.headers['referer'];
    const userId = req.user ? req.user.userId : null;

    // Use IP + UserAgent as a rough fingerprint for anonymous users
    const query = userId ? { user_id: userId } : { ip, user_agent: userAgent };

    await Visitor.findOneAndUpdate(
      query,
      {
        $inc: { visit_count: 1 },
        $set: {
          ip,
          user_agent: userAgent,
          last_page_visited: path,
          referrer,
          user_id: userId,
          updated_at: new Date()
        }
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('[VisitorTracker] Error:', err);
  }
  next();
};

module.exports = { trackVisitor };
