const { body } = require('express-validator');

const recordCreateBody = [
  body('amount')
    .notEmpty()
    .withMessage('amount is required')
    .bail()
    .isFloat()
    .withMessage('amount must be a number')
    .bail()
    .custom((v) => Number(v) > 0)
    .withMessage('amount must be positive'),
  body('type')
    .notEmpty()
    .withMessage('type is required')
    .bail()
    .isIn(['income', 'expense'])
    .withMessage('type must be income or expense'),
  body('category')
    .notEmpty()
    .withMessage('category is required')
    .bail()
    .trim()
    .isLength({ min: 1 })
    .withMessage('category cannot be empty'),
  body('date')
    .notEmpty()
    .withMessage('date is required')
    .bail()
    .isISO8601()
    .withMessage('date must be a valid ISO 8601 date')
    .toDate(),
  body('note').optional().isString().trim(),
];

const recordUpdateBody = [
  body('amount')
    .optional({ values: 'falsy' })
    .isFloat()
    .withMessage('amount must be a number')
    .bail()
    .custom((v) => Number(v) > 0)
    .withMessage('amount must be positive'),
  body('type').optional().isIn(['income', 'expense']).withMessage('type must be income or expense'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('category cannot be empty'),
  body('date').optional().isISO8601().withMessage('date must be a valid ISO 8601 date').toDate(),
  body('note').optional().isString().trim(),
];

module.exports = { recordCreateBody, recordUpdateBody };
