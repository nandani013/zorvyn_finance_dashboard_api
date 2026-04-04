const User = require('../models/User');
const { AppError } = require('../utils/AppError');
const { ALL_ROLES, ROLES, USER_STATUS, ALL_USER_STATUSES } = require('../constants/roles');

async function listUsers(req, res, next) {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.json(users.map(({ _id, ...rest }) => ({ id: _id, ...rest })));
  } catch (e) {
    next(e);
  }
}

async function createUser(req, res, next) {
  try {
    const { email, password, name, role, status } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError(409, 'Email already in use');
    }
    const hashedPassword = await User.hashPassword(password);
    const user = await User.create({
      email,
      password: hashedPassword,
      name: name || '',
      role: role || ROLES.VIEWER,
      status: status || USER_STATUS.ACTIVE,
    });
    res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    });
  } catch (e) {
    next(e);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    if (user._id.equals(req.user._id) && req.body.status === USER_STATUS.INACTIVE) {
      throw new AppError(400, 'Cannot deactivate your own account');
    }
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.role !== undefined) {
      if (!ALL_ROLES.includes(req.body.role)) {
        throw new AppError(400, 'Invalid role');
      }
      if (user._id.equals(req.user._id) && req.body.role !== ROLES.ADMIN) {
        throw new AppError(400, 'Cannot demote your own admin role');
      }
      user.role = req.body.role;
    }
    if (req.body.status !== undefined) {
      if (!ALL_USER_STATUSES.includes(req.body.status)) {
        throw new AppError(400, 'Invalid status');
      }
      user.status = req.body.status;
    }
    if (req.body.password) {
      user.password = await User.hashPassword(req.body.password);
    }
    await user.save();
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { listUsers, createUser, updateUser };
