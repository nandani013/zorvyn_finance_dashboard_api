const mongoose = require('mongoose');

const financialRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'amount is required'],
      validate: {
        validator(v) {
          return typeof v === 'number' && Number.isFinite(v) && v > 0;
        },
        message: 'amount must be a positive number',
      },
    },
    type: { type: String, required: [true, 'type is required'], enum: ['income', 'expense'] },
    category: { type: String, required: [true, 'category is required'], trim: true },
    date: { type: Date, required: [true, 'date is required'] },
    note: { type: String, trim: true, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

financialRecordSchema.index({ date: -1 });
financialRecordSchema.index({ type: 1, category: 1 });
financialRecordSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('FinancialRecord', financialRecordSchema);
