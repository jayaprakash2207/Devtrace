const { validationResult } = require('express-validator');

/**
 * Reads express-validator results and short-circuits with 422
 * if any rule failed. Place this AFTER the rule array in a route:
 *
 *   router.post('/login', loginRules, validate, ctrl.login)
 */
module.exports = function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors: result.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};
