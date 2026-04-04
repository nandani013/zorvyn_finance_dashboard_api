const User = require('../models/User');
const { AppError } = require('../utils/AppError');
const { ROLES, USER_STATUS } = require('../constants/roles');
const { signToken } = require('../middleware/auth');

/**
 * Register a new user. Password is hashed with bcrypt before storage.
 * New accounts default to role VIEWER and status ACTIVE.
 */
async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError(409, 'Email already registered');
    }

    const hashedPassword = await User.hashPassword(password);
    const user = await User.create({
      email,
      password: hashedPassword,
      name: name || '',
      role: ROLES.VIEWER,
      status: USER_STATUS.ACTIVE,
    });

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Authenticate with email and password. On success returns a JWT (HS256)
 * and public user fields. Password is verified with bcrypt against the stored hash.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError(401, 'Invalid email or password');
    }
    if (user.status !== USER_STATUS.ACTIVE) {
      throw new AppError(403, 'Account is inactive');
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function me(req, res) {
  const u = req.user;
  res.json({
    id: u._id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
  });
}

module.exports = { register, login, me };
