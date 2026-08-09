const db = require('../database/db');

class SalesService {
    static async getDashboardData(salesId) {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const today = new Date().toISOString().split('T')[0];

        // 1. Target & Progress Order bulan ini
        const targetQuery = `
            SELECT target_order, target_kunjungan 
            FROM targets 
            WHERE sales_id = $1 AND bulan = $2 AND tahun = $3
        `;
        let targetRes = await db.query(targetQuery, [salesId, currentMonth, currentYear]);
        
        let targetData = targetRes.rows[0] || { target_order: 100, target_kunjungan: 50 };

        // Progress Order dihitung berdasarkan visit_activities.activity = 'order' bulan ini
        const progressQuery = `
            SELECT COUNT(va.id) as total_order
            FROM visit_activities va
            JOIN visits v ON va.visit_id = v.id
            WHERE v.sales_id = $1 
              AND va.activity = 'order'
              AND EXTRACT(MONTH FROM v.tanggal) = $2 
              AND EXTRACT(YEAR FROM v.tanggal) = $3
        `;
        const progressRes = await db.query(progressQuery, [salesId, currentMonth, currentYear]);
        const totalOrderAktual = parseInt(progressRes.rows[0]?.total_order || 0);

        // 2. Kunjungan hari ini
        const visitTodayQuery = `
            SELECT COUNT(*) as kunjungan_hari_ini
            FROM visits
            WHERE sales_id = $1 AND tanggal = $2
        `;
        const visitTodayRes = await db.query(visitTodayQuery, [salesId, today]);
        const kunjunganHariIni = parseInt(visitTodayRes.rows[0]?.kunjungan_hari_ini || 0);

        // 3. Riwayat Kunjungan Terakhir
        const historyQuery = `
            SELECT v.id, p.nama_apotek, v.tanggal, v.jam_checkin, v.catatan,
                   ARRAY_AGG(va.activity) as activities
            FROM visits v
            JOIN pharmacies p ON v.pharmacy_id = p.id
            LEFT JOIN visit_activities va ON v.id = va.visit_id
            WHERE v.sales_id = $1
            GROUP BY v.id, p.nama_apotek, v.tanggal, v.jam_checkin, v.catatan
            ORDER BY v.tanggal DESC, v.jam_checkin DESC
            LIMIT 5
        `;
        const historyRes = await db.query(historyQuery, [salesId]);

        // 4. Produk Push & Diskon
        const productsQuery = `
            SELECT id, nama_produk, harga, stok, push_produk, diskon
            FROM products
            WHERE push_produk = true OR diskon > 0
            LIMIT 5
        `;
        const productsRes = await db.query(productsQuery);

        return {
            target: {
                target_order: targetData.target_order,
                order_aktual: totalOrderAktual,
                target_kunjungan: targetData.target_kunjungan,
                kunjungan_hari_ini: kunjunganHariIni
            },
            riwayat_kunjungan: historyRes.rows,
            produk_unggulan: productsRes.rows
        };
    }
}

module.exports = SalesService;