const Wishlist = require('../models/Wishlist');

const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products');
    res.json(wishlist || { products: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }
    if (wishlist.products.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    wishlist.products.push(productId);
    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
    wishlist.products = wishlist.products.filter(
      p => p.toString() !== req.params.productId
    );
    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const clearWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { products: [] }
    );
    res.json({ message: 'Wishlist cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, clearWishlist };