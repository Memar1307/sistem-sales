const db = require('../database/db');

class InkasoService {
    static async getInvoicesByPharmacy(pharmacyId) {
        // Query ini sekarang menampilkan semua invoice (termasuk yang lunas)
        const query = `
            SELECT 
                id, 
                nomor_faktur, 
                total, 
                sisa_tagihan, 
                jatuh_tempo, 
                status,
                CASE 
                    WHEN sisa_tagihan = total THEN 'Belum Lunas'
                    WHEN sisa_tagihan < total AND sisa_tagihan > 0 THEN 'Dibayar Sebagian'
                    ELSE 'Lunas'
                END AS status_label
            FROM invoices 
            WHERE pharmacy_id = $1
            ORDER BY jatuh_tempo ASC
        `;
        const result = await db.query(query, [pharmacyId]);
        return result.rows;
    }

    static async saveInkaso(data) {
        const { salesId, pharmacy_id, invoice_id, nominal, metode_pembayaran, catatan } = data;
        
        // 1. Simpan riwayat pembayaran
        const query = `
            INSERT INTO inkasos (sales_id, pharmacy_id, invoice_id, nominal, metode_pembayaran, catatan, tanggal)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING *
        `;
        const values = [salesId, pharmacy_id, invoice_id, nominal, metode_pembayaran, catatan];
        const result = await db.query(query, values);

        // 2. Perbarui sisa_tagihan dan status di tabel invoices
        const invoiceQuery = `SELECT sisa_tagihan FROM invoices WHERE id = $1`;
        const invoiceRes = await db.query(invoiceQuery, [invoice_id]);
        
        if (invoiceRes.rows.length > 0) {
            const currentSisa = parseFloat(invoiceRes.rows[0].sisa_tagihan);
            const paidNominal = parseFloat(nominal);
            
            let newSisa = currentSisa - paidNominal;
            if (newSisa < 0) newSisa = 0;

            let newStatus = 'belum_lunas';
            if (newSisa === 0) {
                newStatus = 'lunas';
            } else if (newSisa < currentSisa) {
                newStatus = 'sebagian';
            }

            const updateQuery = `
                UPDATE invoices 
                SET sisa_tagihan = $1, status = $2 
                WHERE id = $3
            `;
            await db.query(updateQuery, [newSisa, newStatus, invoice_id]);
        }

        return result.rows[0];
    }
}

module.exports = InkasoService;