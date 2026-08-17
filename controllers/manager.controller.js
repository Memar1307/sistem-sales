const { getPool } = require('../database/db');

class ManagerController {
    static async getDashboardSummary(req, res) {
        try {
            // Ambil wilayah dari query parameter atau header (default ke 'barat')
            const region = req.query.region || req.headers['x-region'] || 'barat';
            const pool = getPool(region);

            // Contoh query ringkasan untuk dashboard manager
            // Sesuaikan nama tabel dengan database Anda
            const [salesResult] = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as totalSales FROM invoices");
            const [visitsResult] = await pool.query("SELECT COUNT(*) as totalVisits FROM visits");
            const [inkasoResult] = await pool.query("SELECT COALESCE(SUM(amount), 0) as totalInkaso FROM inkaso");

            return res.status(200).json({
                success: true,
                region: region,
                data: {
                    totalSales: salesResult[0].totalSales,
                    totalVisits: visitsResult[0].totalVisits,
                    totalInkaso: inkasoResult[0].totalInkaso
                }
            });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = ManagerController;