const FinancialRecord = require('../models/FinancialRecord');

/**
 * @param {{ from?: Date, to?: Date }} range
 */
function buildDateFilter(range) {
  if (!range.from && !range.to) return {};
  const d = {};
  if (range.from) d.$gte = range.from;
  if (range.to) d.$lte = range.to;
  return { date: d };
}

/**
 * Dashboard figures: income/expense totals, net balance, and per-(category,type) totals.
 *
 * @param {{ from?: Date, to?: Date }} range - optional `date` window on records
 * @returns {Promise<{
 *   totalIncome: number,
 *   totalExpense: number,
 *   netBalance: number,
 *   categoryTotals: Array<{ category: string, type: string, total: number }>
 * }>}
 */
async function getDashboardMetrics(range = {}) {
  const baseFilter = buildDateFilter(range);

  const [totalsAgg] = await FinancialRecord.aggregate([
    { $match: baseFilter },
    {
      $group: {
        _id: null,
        totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
        totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
      },
    },
  ]);

  const totalIncome = totalsAgg?.totalIncome ?? 0;
  const totalExpense = totalsAgg?.totalExpense ?? 0;

  const categoryTotals = await FinancialRecord.aggregate([
    { $match: baseFilter },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { total: -1 } },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        total: 1,
      },
    },
  ]);

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    categoryTotals,
  };
}

module.exports = { getDashboardMetrics, buildDateFilter };
