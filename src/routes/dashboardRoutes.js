const { Router } = require('express');
const { query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { verifyJwt, canViewDashboard } = require('../middleware/auth');
const { summary } = require('../controllers/dashboardController');

/**
 * Dashboard API — mounted at `/api/dashboard`.
 *
 * Every route requires a valid JWT (`Authorization: Bearer <token>`) via `verifyJwt`.
 * Role check: `canViewDashboard` (VIEWER, ANALYST, or ADMIN).
 */
const router = Router();

router.use(verifyJwt);
router.use(canViewDashboard);

const summaryValidators = [
  query('from').optional().isISO8601().toDate(),
  query('to').optional().isISO8601().toDate(),
  validateRequest,
];

router.get('/summary', ...summaryValidators, summary);

module.exports = router;
