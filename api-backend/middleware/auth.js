const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    res.status(401);
    return next(new Error('Unauthorized'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    res.status(401);
    return next(new Error('Invalid token'));
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403);
    return next(new Error('Forbidden'));
  }
  return next();
};

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type === 'Bearer' && token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Ignore invalid token in optional auth
    }
  }
  next();
};

module.exports = { requireAuth, requireAdmin, optionalAuth };
