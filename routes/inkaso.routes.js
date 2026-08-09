const express = require('express');
const router = express.Router();
const InkasoController = require('../controllers/inkaso.controller'); //[cite: 1]

// Gunakan destrukturisasi jika auth.js mengekspor objek { verifyToken }
const { verifyToken } = require('../middleware/auth');

router.get('/invoices/:pharmacyId', verifyToken, InkasoController.getInvoices); //[cite: 2]
router.post('/inkaso', verifyToken, InkasoController.createInkaso); //[cite: 2]

module.exports = router; //[cite: 2]