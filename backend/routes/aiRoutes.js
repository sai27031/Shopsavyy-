const express = require('express');
const router = express.Router();
const {
  chat,
  getProductInsights,
  getRecommendations,
} = require('../controllers/aiController');

router.post('/chat',                chat);
router.get('/insights/:id',         getProductInsights);
router.get('/recommendations/:id',  getRecommendations);

module.exports = router;