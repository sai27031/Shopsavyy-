const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name:     { type: String, required: true },
    image:    { type: String },
    price:    { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    size:     { type: String },
    color:    { type: String },
  }],
  shippingAddress: {
    fullName: String,
    address:  String,
    city:     String,
    state:    String,
    pincode:  String,
    phone:    String,
  },
  paymentMethod:  { type: String, required: true, default: 'COD' },
  paymentResult:  { id: String, status: String, update_time: String },
  itemsPrice:     { type: Number, required: true, default: 0 },
  shippingPrice:  { type: Number, required: true, default: 0 },
  totalPrice:     { type: Number, required: true, default: 0 },
  isPaid:         { type: Boolean, default: false },
  paidAt:         { type: Date },
  isDelivered:    { type: Boolean, default: false },
  deliveredAt:    { type: Date },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);