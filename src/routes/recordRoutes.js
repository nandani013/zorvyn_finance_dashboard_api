const { Router } = require('express');
const { param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { recordCreateBody, recordUpdateBody } = require('../middleware/validators/recordBody');
const { verifyJwt, canReadRecords, canMutateRecords } = require('../middleware/auth');
const {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
} = require('../controllers/recordController');

/**
 * Financial records API — mounted at `/api/records`.
 *
 * All routes use `verifyJwt`: valid `Authorization: Bearer <token>` required; `req.user` is set.
 * Reads (GET) require ANALYST or ADMIN. Writes (POST, PUT, DELETE) require ADMIN.
 */
const router = Router();

router.use(verifyJwt);

const listValidators = [
  query('type').optional().isIn(['income', 'expense']),
  query('category').optional().isString().trim(),
  query('date').optional().isISO8601().toDate(),
  query('from').optional().isISO8601().toDate(),
  query('to').optional().isISO8601().toDate(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest,
];

router.get('/', canReadRecords, ...listValidators, listRecords);

router.get('/:id', canReadRecords, param('id').isMongoId(), validateRequest, getRecord);

router.post('/', canMutateRecords, ...recordCreateBody, validateRequest, createRecord);

router.put(
  '/:id',
  canMutateRecords,
  param('id').isMongoId(),
  ...recordUpdateBody,
  validateRequest,
  updateRecord
);

router.delete('/:id', canMutateRecords, param('id').isMongoId(), validateRequest, deleteRecord);

module.exports = router;
