const { AppError } = require('../utils/AppError');
const { ALL_ROLES } = require('../constants/roles');

/**
 * Role-based access control. Use **after** `verifyJwt` / `requireAuth` so `req.user` exists.
 * Calls `next()` only when `req.user.role` is one of `allowedRoles`; otherwise `403`.
 *
 * @param {...string} allowedRoles - must be values from `ROLES` (e.g. `ROLES.ADMIN`)
 * @returns {import('express').RequestHandler}
 */
function allowRoles(...allowedRoles) {
  if (allowedRoles.length === 0) {
    throw new Error('allowRoles: pass at least one role');
  }
  const unknown = allowedRoles.filter((r) => !ALL_ROLES.includes(r));
  if (unknown.length > 0) {
    throw new Error(`allowRoles: unknown role(s): ${unknown.join(', ')}`);
  }

  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient permissions'));
    }
    next();
  };
}

/**
 * Same behavior as `allowRoles` but accepts a role array (e.g. from config).
 *
 * @param {string[]} allowedRoles
 * @returns {import('express').RequestHandler}
 */
function allowRolesFrom(allowedRoles) {
  return allowRoles(...allowedRoles);
}

module.exports = { allowRoles, allowRolesFrom };
