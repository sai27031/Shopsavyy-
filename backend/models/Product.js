const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const priceHistorySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  date:  { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  description:   { type: String, required: true },
  price:         { type: Number, required: true, default: 0 },
  originalPrice: { type: Number },
  category:      { type: String, required: true, enum: ['clothing', 'electronics'] },
  subCategory:   { type: String },
  brand:         { type: String },
  image:         { type: String, required: true },
  images:        [{ type: String }],
  stock:         { type: Number, required: true, default: 0 },
  reviews:       [reviewSchema],
  rating:        { type: Number, default: 0 },
  numReviews:    { type: Number, default: 0 },
  priceHistory:  [priceHistorySchema],
  tags:          [{ type: String }],
  featured:      { type: Boolean, default: false },
  sizes:         [{ type: String }],
  colors:        [{ type: String }],
}, { timestamps: true });

productSchema.pre('save', function (next) {
  if (this.isModified('price')) {
    this.priceHistory.push({ price: this.price, date: new Date() });
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);