const express = require('express');
const { getBinders, createBinder, deleteBinder, editBinder } = require('../controllers/binderController');
const isAuthenticated = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', isAuthenticated, getBinders);
router.post('/', isAuthenticated, createBinder);
router.put('/:binderId', isAuthenticated, editBinder); // For editing binders
router.delete('/:binderId', isAuthenticated, deleteBinder);

module.exports = router;