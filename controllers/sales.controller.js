const SalesService = require('../services/sales.service');
const { getPool } = require('../database/db');

class SalesController {
    static async getDashboard(req, res) {
        try {
            const salesId = req.user.id;
            // Mendukung pemilihan wilayah via header atau query (default ke 'barat')
            const region = req.headers['x-region'] || req.query.region || 'barat';
            
            // Jika service membutuhkan db pool berdasarkan region
            const data = await SalesService.getDashboardData(salesId, region);
            return res.status(200).json({ region, ...data });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = SalesController;