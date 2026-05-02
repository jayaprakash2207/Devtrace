const jwt = require('jsonwebtoken');

const SECRET  = () => process.env.JWT_SECRET;
const EXPIRES = () => process.env.JWT_EXPIRES_IN || '7d';

/**
 * Signs a JWT with the given payload.
 * @param  {object} payload  — e.g. { id: user._id }
 * @returns {string}           signed token
 */
function signToken(payload) {
  if (!SECRET()) throw new Error('JWT_SECRET is not set');
  return jwt.sign(payload, SECRET(), { expiresIn: EXPIRES() });
}

/**
 * Verifies and decodes a JWT.
 * Throws JsonWebTokenError or TokenExpiredError on failure.
 * @param  {string} token
 * @returns {object}  decoded payload
 */
function verifyToken(token) {
  if (!SECRET()) throw new Error('JWT_SECRET is not set');
  return jwt.verify(token, SECRET());
}

module.exports = { signToken, verifyToken };
