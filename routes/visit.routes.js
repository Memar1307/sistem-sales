const express = require('express');
const VisitController = require('../controllers/visit.controller');
const { verifyToken, verifySalesRole } = require('../middleware/auth');

const router = express.Router();

router.get('/pharmacies', verifyToken, verifySalesRole, VisitController.getPharmacies);
router.post('/checkin', verifyToken, verifySalesRole, VisitController.createVisit);

// INI WAJIB ADA:
module.exports = router;