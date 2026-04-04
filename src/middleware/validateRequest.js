const { validationResult } = require('express-validator');
const { AppError } = require('../utils/AppError');

function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new AppError(400, 'Validation failed', result.array()));
  }
  next();
}

module.exports = { validateRequest };
