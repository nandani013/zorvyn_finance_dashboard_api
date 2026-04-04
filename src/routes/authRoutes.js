const { Router } = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { register, login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = Router();

/** POST /api/auth/register — body: { email, password, name? } */
router.post(
  '/register',
  body('email').notEmpty().withMessage('email is required').bail().isEmail().normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .bail()
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 characters'),
  body('name').optional().isString().trim(),
  validateRequest,
  register
);

/** POST /api/auth/login — body: { email, password } — returns JWT */
router.post(
  '/login',
  body('email').notEmpty().withMessage('email is required').bail().isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('password is required'),
  validateRequest,
  login
);

/** GET /api/auth/me — Bearer token */
router.get('/me', requireAuth, me);

module.exports = router;
