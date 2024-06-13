const express = require('express');
const { getStores, getStoreById, createStore } = require('../controllers/storeController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(getStores)
  .post(protect, createStore);

router.route('/:id')
  .get(getStoreById);

module.exports = router;
