const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  applyCoupon,
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  toggleCoupon,
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/validate',     protect, validateCoupon);
router.post('/apply',        protect, applyCoupon);
router.post('/',             protect, admin, createCoupon);
router.get('/',              protect, admin, getAllCoupons);
router.delete('/:id',        protect, admin, deleteCoupon);
router.put('/:id/toggle',    protect, admin, toggleCoupon);

module.exports = router;