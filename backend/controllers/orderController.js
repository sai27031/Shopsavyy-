const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../utils/emailService');

const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!items?.length)
      return res.status(400).json({ message: 'No order items' });

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    // Send order confirmation email
    try {
      const user = await User.findById(req.user._id);
      await sendOrderConfirmation(order, user.email, user.name);
    } catch (emailErr) {
      console.error('Email failed:', emailErr);
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');
    if (!order)
      return res.status(404).json({ message: 'Order not found' });
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    )
      return res.status(403).json({ message: 'Not authorized' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        ...(req.body.status === 'delivered'
          ? { isDelivered: true, deliveredAt: new Date() }
          : {}),
      },
      { new: true }
    ).populate('user', 'name email');

    if (!order)
      return res.status(404).json({ message: 'Order not found' });

    // Send status update email
    try {
      await sendOrderStatusUpdate(
        order,
        order.user.email,
        order.user.name,
        req.body.status
      );
    } catch (emailErr) {
      console.error('Email failed:', emailErr);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};