const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/AppError');
const { USER_STATUS } = require('../constants/roles');
const {
  DASHBOARD_READ_ROLES,
  FINANCIAL_RECORDS_READ_ROLES,
  FINANCIAL_RECORDS_WRITE_ROLES,
  USER_MANAGE_ROLES,
} = require('../constants/rbac');
const { allowRoles, allowRolesFrom } = require('./authorize');

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ sub: user._id.toString(), role: user.role }, secret, { expiresIn });
}

function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string' || !header.startsWith('Bearer ')) {
    return null;
  }
  return header.slice(7).trim();
}

/**
 * Verifies the JWT from `Authorization: Bearer <token>`, loads the user from the database,
 * and attaches the Mongoose user document to `req.user`. Rejects missing/invalid tokens and inactive users.
 */
async function verifyJwt(req, res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      throw new AppError(401, 'Missing or invalid Authorization header');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }

    const payload = jwt.verify(token, secret);
    const userId = payload.sub;
    if (!userId) {
      throw new AppError(401, 'Invalid token payload');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(401, 'User not found');
    }
    if (user.status !== USER_STATUS.ACTIVE) {
      throw new AppError(403, 'Account is inactive');
    }

    req.user = user;
    next();
  } catch (e) {
    if (e instanceof AppError) {
      return next(e);
    }
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      return next(new AppError(401, 'Invalid or expired token'));
    }
    next(e);
  }
}

/** Alias for `verifyJwt` (same middleware). */
const requireAuth = verifyJwt;

/** Same as `allowRoles` (kept for existing route imports). */
const requireRoles = allowRoles;

/** VIEWER, ANALYST, ADMIN — read-only dashboard metrics. */
const canViewDashboard = allowRoles(...DASHBOARD_READ_ROLES);

/** ANALYST, ADMIN — read financial records (GET list / GET by id). */
const canReadRecords = allowRoles(...FINANCIAL_RECORDS_READ_ROLES);

/** ADMIN — create / update / delete financial records. */
const canMutateRecords = allowRoles(...FINANCIAL_RECORDS_WRITE_ROLES);

/** ADMIN — list / create / update users. */
const canManageUsers = allowRoles(...USER_MANAGE_ROLES);

module.exports = {
  signToken,
  extractBearerToken,
  verifyJwt,
  requireAuth,
  allowRoles,
  allowRolesFrom,
  requireRoles,
  canViewDashboard,
  canReadRecords,
  canMutateRecords,
  canManageUsers,
};
