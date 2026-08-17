const db = require('../database/db');

class ManagerService {
    static async getGlobalSummary() {
        let totalOrders = 0;
        let totalVisits = 0;
        let totalSales = 0;

        try {
            // Diubah mengecek dari visit_activities dengan activity = 'order'
            const orderResult = await db.query("SELECT COUNT(*) AS total FROM visit_activities WHERE LOWER(activity) = 'order'");
            totalOrders = Number(orderResult.rows[0].total || 0);
        } catch (e) { console.error('Error Order:', e.message); }

        try {
            const visitResult = await db.query('SELECT COUNT(*) AS total FROM visits');
            totalVisits = Number(visitResult.rows[0].total || 0);
        } catch (e) { console.error('Error Visit:', e.message); }

        try {
            const salesResult = await db.query("SELECT COUNT(*) AS total FROM users WHERE LOWER(role) = 'sales'");
            totalSales = Number(salesResult.rows[0].total || 0);
        } catch (e) { 
            totalSales = 0;
        }

        return { 
            success: true, 
            data: { 
                totalOrders, 
                totalVisits, 
                totalSales 
            } 
        };
    }

    static async getChartData() {
        try {
            const query = `
                SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as count 
                FROM visit_activities 
                WHERE LOWER(activity) = 'order'
                GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
                ORDER BY EXTRACT(MONTH FROM created_at)
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (e) { 
            console.error('Error Chart:', e.message); 
            return []; 
        }
    }

    static async getVisitRatio() {
        try {
            const totalVisitsRes = await db.query('SELECT COUNT(*) AS total FROM visits');
            const totalVisits = Number(totalVisitsRes.rows[0].total || 0);

            let visitsWithOrder = 0;
            try {
                // Diubah menghitung visit_id unik dari visit_activities yang order
                const res = await db.query("SELECT COUNT(DISTINCT visit_id) AS total FROM visit_activities WHERE LOWER(activity) = 'order'");
                visitsWithOrder = Number(res.rows[0].total || 0);
            } catch (err1) {
                const orderRes = await db.query("SELECT COUNT(*) AS total FROM visit_activities WHERE LOWER(activity) = 'order'");
                const totalOrders = Number(orderRes.rows[0].total || 0);
                visitsWithOrder = Math.min(totalOrders, totalVisits);
            }

            const visitsWithoutOrder = Math.max(0, totalVisits - visitsWithOrder);

            return {
                success: true,
                data: {
                    totalVisits,
                    visitsWithOrder,
                    visitsWithoutOrder
                }
            };
        } catch (e) {
            console.error('Error Visit Ratio:', e.message);
            return { success: false, data: { totalVisits: 0, visitsWithOrder: 0, visitsWithoutOrder: 0 } };
        }
    }

    static async getSalesList() {
        try {
            const query = "SELECT * FROM users WHERE LOWER(role) = 'sales' ORDER BY nama ASC";
            const result = await db.query(query);
            return { success: true, data: result.rows };
        } catch (e) {
            console.error('Error Sales List:', e.message);
            return { success: true, data: [] };
        }
    }

    static async getSalesDetail(salesId) {
        try {
            const salesRes = await db.query("SELECT * FROM users WHERE id = $1", [salesId]);
            const sales = salesRes.rows[0] || {};

            let visits = [];
            try {
                const vRes = await db.query(`
                    SELECT v.*, va.activity, va.keterangan as activity_keterangan 
                    FROM visits v
                    LEFT JOIN visit_activities va ON v.id = va.visit_id
                    WHERE (v.sales_id = $1 OR v.user_id = $1 OR v.salesperson_id = $1 OR v.created_by = $1)
                    ORDER BY v.created_at DESC
                    LIMIT 50
                `, [salesId]);
                visits = vRes.rows;
            } catch (err) { visits = []; }

            if (visits.length === 0) {
                try {
                    const vResAll = await db.query(`
                        SELECT v.*, va.activity, va.keterangan as activity_keterangan 
                        FROM visits v
                        LEFT JOIN visit_activities va ON v.id = va.visit_id
                        ORDER BY v.created_at DESC
                        LIMIT 50
                    `);
                    visits = vResAll.rows;
                } catch (e) {}
            }

            const orders = [];
            const inkaso = [];

            return {
                success: true,
                data: { sales, visits, orders, inkaso }
            };
        } catch (e) {
            console.error('Error Sales Detail:', e.message);
            return { success: false, error: e.message };
        }
    }

    static async getApotekList() {
        try {
            const query = "SELECT * FROM pharmacies ORDER BY 1 ASC";
            const result = await db.query(query);
            return { success: true, data: result.rows };
        } catch (e) {
            console.error('Error Apotek List:', e.message);
            return { success: true, data: [] };
        }
    }

    static async getPharmacyDetail(pharmacyId) {
        try {
            const pharmRes = await db.query("SELECT * FROM pharmacies WHERE id = $1", [pharmacyId]);
            const pharmacy = pharmRes.rows[0] || {};

            let invoices = [];
            const invoiceColumns = ['pharmacy_id', 'outlet_id', 'pharmacies_id', 'apotek_id', 'customer_id', 'id_pharmacy'];
            for (const col of invoiceColumns) {
                try {
                    const invRes = await db.query(`
                        SELECT id, nomor_faktur, created_at, total, sisa_tagihan, jatuh_tempo, status 
                        FROM invoices 
                        WHERE ${col} = $1 
                        ORDER BY created_at DESC
                    `, [pharmacyId]);
                    if (invRes.rows.length > 0) {
                        invoices = invRes.rows;
                        break;
                    }
                } catch (err) {}
            }

            let inkaso = [];
            const inkasoColumns = ['pharmacy_id', 'outlet_id', 'pharmacies_id', 'apotek_id', 'customer_id', 'id_pharmacy'];
            for (const col of inkasoColumns) {
                try {
                    const inkRes = await db.query(`
                        SELECT * FROM inkaso 
                        WHERE ${col} = $1 
                        ORDER BY created_at DESC
                    `, [pharmacyId]);
                    if (inkRes.rows.length > 0) {
                        inkaso = inkRes.rows;
                        break;
                    }
                } catch (err) {}
            }

            return {
                success: true,
                data: { pharmacy, invoices, inkaso }
            };
        } catch (e) {
            console.error('Error Pharmacy Detail:', e.message);
            return { success: false, error: e.message };
        }
    }
}

module.exports = ManagerService;