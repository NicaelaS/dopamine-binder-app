const express = require('express');
const { createBinder } = require('../controllers/binderController');

const router = express.Router();

router.post('/', createBinder);

module.exports = router;