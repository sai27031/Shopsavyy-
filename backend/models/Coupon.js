const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType:  { type: String, required: true, enum: ['percentage', 'flat'] },
  discountValue: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount:   { type: Number },
  usageLimit:    { type: Number, default: 100 },
  usedCount:     { type: Number, default: 0 },
  expiryDate:    { type: Date, required: true },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);