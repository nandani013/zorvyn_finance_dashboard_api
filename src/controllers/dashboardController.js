const { AppError } = require('../utils/AppError');
const { getDashboardMetrics } = require('../services/dashboardService');

/**
 * GET /api/dashboard/summary
 * Computes total income, total expense, net balance, and category-wise totals (by category + type).
 */
async function summary(req, res, next) {
  try {
    const range = parseDateRange(req.query);
    const metrics = await getDashboardMetrics(range);
    res.json(metrics);
  } catch (e) {
    next(e);
  }
}

function parseDateRange(query) {
  const range = {};
  if (query.from) {
    const from = query.from instanceof Date ? query.from : new Date(query.from);
    if (Number.isNaN(from.getTime())) {
      throw new AppError(400, 'Invalid from date');
    }
    range.from = from;
  }
  if (query.to) {
    const to = query.to instanceof Date ? query.to : new Date(query.to);
    if (Number.isNaN(to.getTime())) {
      throw new AppError(400, 'Invalid to date');
    }
    range.to = to;
  }
  if (range.from && range.to && range.from > range.to) {
    throw new AppError(400, 'from must be before or equal to to');
  }
  return range;
}

module.exports = { summary };
