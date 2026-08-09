const express = require('express');
const SalesController = require('../controllers/sales.controller');
const { verifyToken, verifySalesRole } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', verifyToken, verifySalesRole, SalesController.getDashboard);

module.exports = router;