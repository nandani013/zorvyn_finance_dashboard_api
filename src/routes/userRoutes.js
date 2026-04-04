const { Router } = require('express');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { requireAuth, canManageUsers } = require('../middleware/auth');
const { listUsers, createUser, updateUser } = require('../controllers/userController');
const { ALL_ROLES, ALL_USER_STATUSES } = require('../constants/roles');

const router = Router();

router.use(requireAuth, canManageUsers);

router.get('/', listUsers);

router.post(
  '/',
  body('email').notEmpty().withMessage('email is required').bail().isEmail().normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .bail()
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 characters'),
  body('name').optional().isString().trim(),
  body('role').optional().isIn(ALL_ROLES),
  body('status').optional().isIn(ALL_USER_STATUSES),
  validateRequest,
  createUser
);

router.patch(
  '/:id',
  param('id').isMongoId().withMessage('invalid user id'),
  body('name').optional().isString().trim(),
  body('role').optional().isIn(ALL_ROLES),
  body('status').optional().isIn(ALL_USER_STATUSES),
  body('password').optional().isLength({ min: 8 }).withMessage('password must be at least 8 characters'),
  validateRequest,
  updateUser
);

module.exports = router;
