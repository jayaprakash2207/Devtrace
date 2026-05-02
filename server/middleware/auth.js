const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Protects routes that require a valid JWT.
 * Attaches the full user document to req.user.
 *
 * Expected header:  Authorization: Bearer <token>
 */
module.exports = async function protect(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token — access denied' });
  }

  const token = header.slice(7); // trim "Bearer "

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ success: false, message });
  }

  const user = await User.findById(payload.id).lean();
  if (!user) {
    return res.status(401).json({ success: false, message: 'User no longer exists' });
  }

  req.user = user; // downstream handlers can trust req.user._id
  next();
};
