const mongoose = require('mongoose');
const FinancialRecord = require('../models/FinancialRecord');
const { AppError } = require('../utils/AppError');

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** UTC midnight-to-end for the calendar day of the given instant. */
function utcDayBounds(d) {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  return {
    $gte: new Date(Date.UTC(y, m, day, 0, 0, 0, 0)),
    $lte: new Date(Date.UTC(y, m, day, 23, 59, 59, 999)),
  };
}

/**
 * Build MongoDB filter from query: type, category, and date.
 * Date: either `date` (single UTC day) or `from` / `to` (inclusive range), not both.
 */
function buildListFilter(query) {
  const filter = {};

  if (query.type) {
    if (!['income', 'expense'].includes(query.type)) {
      throw new AppError(400, 'type must be income or expense');
    }
    filter.type = query.type;
  }

  if (query.category) {
    filter.category = new RegExp(`^${escapeRegex(query.category)}$`, 'i');
  }

  const hasDay = query.date != null && query.date !== '';
  const hasRange = query.from != null && query.from !== '' || query.to != null && query.to !== '';

  if (hasDay && hasRange) {
    throw new AppError(400, 'Use either date (single day) or from/to range, not both');
  }

  if (hasDay) {
    const d = query.date instanceof Date ? query.date : new Date(query.date);
    if (Number.isNaN(d.getTime())) {
      throw new AppError(400, 'Invalid date');
    }
    filter.date = utcDayBounds(d);
  } else if (hasRange) {
    filter.date = {};
    if (query.from) {
      filter.date.$gte = query.from instanceof Date ? query.from : new Date(query.from);
    }
    if (query.to) {
      filter.date.$lte = query.to instanceof Date ? query.to : new Date(query.to);
    }
    if (
      filter.date.$gte &&
      filter.date.$lte &&
      filter.date.$gte.getTime() > filter.date.$lte.getTime()
    ) {
      throw new AppError(400, 'from must be before or equal to to');
    }
  }

  return filter;
}

/** GET /api/records — paginated list with filters: type, category, date | from, to */
async function listRecords(req, res, next) {
  try {
    const filter = buildListFilter(req.query);
    const { page, limit, skip } = parsePagination(req.query);

    const [items, total] = await Promise.all([
      FinancialRecord.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email name')
        .lean(),
      FinancialRecord.countDocuments(filter),
    ]);

    res.json({
      data: items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (e) {
    next(e);
  }
}

/** GET /api/records/:id */
async function getRecord(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new AppError(400, 'Invalid record id');
    }
    const doc = await FinancialRecord.findById(req.params.id).populate('userId', 'email name');
    if (!doc) {
      throw new AppError(404, 'Record not found');
    }
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

/** POST /api/records */
async function createRecord(req, res, next) {
  try {
    const { amount, type, category, date, note } = req.body;
    const doc = await FinancialRecord.create({
      amount,
      type,
      category,
      date: new Date(date),
      note: note || '',
      userId: req.user._id,
    });
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
}

/** PUT /api/records/:id */
async function updateRecord(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new AppError(400, 'Invalid record id');
    }
    const doc = await FinancialRecord.findById(req.params.id);
    if (!doc) {
      throw new AppError(404, 'Record not found');
    }
    const { amount, type, category, date, note } = req.body;
    if (amount !== undefined) doc.amount = amount;
    if (type !== undefined) doc.type = type;
    if (category !== undefined) doc.category = category;
    if (date !== undefined) doc.date = new Date(date);
    if (note !== undefined) doc.note = note;
    await doc.save();
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

/** DELETE /api/records/:id */
async function deleteRecord(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new AppError(400, 'Invalid record id');
    }
    const doc = await FinancialRecord.findByIdAndDelete(req.params.id);
    if (!doc) {
      throw new AppError(404, 'Record not found');
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
};
