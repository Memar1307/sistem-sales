const SalesService = require('../services/sales.service');

class SalesController {
    static async getDashboard(req, res) {
        try {
            const salesId = req.user.id;
            const data = await SalesService.getDashboardData(salesId);
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = SalesController;