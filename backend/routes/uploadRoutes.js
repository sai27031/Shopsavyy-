const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
} = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/single',    protect, admin, upload.single('image'),   uploadImage);
router.post('/multiple',  protect, admin, upload.array('images', 5), uploadMultipleImages);
router.delete('/',        protect, admin, deleteImage);

module.exports = router;