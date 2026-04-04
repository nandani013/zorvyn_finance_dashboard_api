const auth = require('./auth');
const { errorHandler } = require('./errorHandler');
const { validateRequest } = require('./validateRequest');

module.exports = {
  ...auth,
  errorHandler,
  validateRequest,
};
