const express = require('express');
const router = express.Router();
const ManagerService = require('../services/manager.service');
const { verifyToken } = require('../middleware/auth'); 

router.get('/summary/all', verifyToken, async (req, res) => {
    try {
        const result = await ManagerService.getGlobalSummary();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/chart-data', verifyToken, async (req, res) => {
    try {
        const data = await ManagerService.getChartData();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/visit-ratio', verifyToken, async (req, res) => {
    try {
        const result = await ManagerService.getVisitRatio();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/sales', verifyToken, async (req, res) => {
    try {
        const result = await ManagerService.getSalesList();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/sales/:id/detail', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ManagerService.getSalesDetail(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/apotek', verifyToken, async (req, res) => {
    try {
        const result = await ManagerService.getApotekList();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// TAMBAHAN: Endpoint detail apotek (invoice & inkaso)
router.get('/apotek/:id/detail', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ManagerService.getPharmacyDetail(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;