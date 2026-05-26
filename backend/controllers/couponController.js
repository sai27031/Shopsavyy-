const Coupon = require('../models/Coupon');

const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon)
      return res.status(404).json({ message: 'Invalid coupon code' });
    if (!coupon.isActive)
      return res.status(400).json({ message: 'Coupon is no longer active' });
    if (new Date() > coupon.expiryDate)
      return res.status(400).json({ message: 'Coupon has expired' });
    if (coupon.usedCount >= coupon.usageLimit)
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    if (orderTotal < coupon.minOrderValue)
      return res.status(400).json({ message: `Minimum order value is ₹${coupon.minOrderValue}` });

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    } else {
      discountAmount = coupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, orderTotal);

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discountAmount),
      message: `Coupon applied! You save ₹${Math.round(discountAmount)}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.body.code.toUpperCase() });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    coupon.usedCount += 1;
    await coupon.save();
    res.json({ message: 'Coupon applied successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { validateCoupon, applyCoupon, createCoupon, getAllCoupons, deleteCoupon, toggleCoupon };