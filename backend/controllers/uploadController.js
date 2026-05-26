const { cloudinary } = require('../config/cloudinary');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    res.json({
      url:       req.file.path,
      publicId:  req.file.filename,
      message:   'Image uploaded successfully',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files?.length)
      return res.status(400).json({ message: 'No images uploaded' });
    const urls = req.files.map(f => ({
      url:      f.path,
      publicId: f.filename,
    }));
    res.json({ urls, message: 'Images uploaded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ message: 'No public ID provided' });
    await cloudinary.uploader.destroy(publicId);
    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { uploadImage, uploadMultipleImages, deleteImage };