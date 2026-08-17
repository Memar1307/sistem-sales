const express = require('express');
const VisitController = require('../controllers/visit.controller');
const { verifyToken, verifySalesRole } = require('../middleware/auth');
const upload = require('../middleware/upload'); // 1. Import middleware multer untuk upload foto

const router = express.Router();

router.get('/pharmacies', verifyToken, verifySalesRole, VisitController.getPharmacies);

// 2. Sisipkan upload.single('foto') di antara middleware auth dan controller
router.post('/checkin', verifyToken, verifySalesRole, upload.single('foto'), VisitController.createVisit);

// INI WAJIB ADA:
module.exports = router;
