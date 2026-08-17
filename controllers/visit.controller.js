const db = require('../database/db');

class VisitController {
    // Ambil daftar apotek
    static async getPharmacies(req, res) {
        try {
            const result = await db.query('SELECT * FROM pharmacies WHERE status = $1 ORDER BY nama_apotek ASC', ['aktif']);
            return res.status(200).json(result.rows);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // Proses Check-in Kunjungan & Aktivitas
    static async createVisit(req, res) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            const salesId = req.user.id;
            const { pharmacy_id, latitude, longitude, activity, keterangan } = req.body;

            // 1. Tangkap file foto jika dikirim lewat multipart/form-data (Multer)
            let fotoPath = null;
            if (req.file) {
                fotoPath = `/uploads/${req.file.filename}`;
            } else if (req.body.foto) {
                fotoPath = req.body.foto;
            }

            // 2. Ambil koordinat apotek untuk validasi radius (misal: maks 150 meter)
            const pharmRes = await client.query('SELECT latitude, longitude, nama_apotek FROM pharmacies WHERE id = $1', [pharmacy_id]);
            if (pharmRes.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Apotek tidak ditemukan.' });
            }

            const apotek = pharmRes.rows[0];
            const distKm = calculateDistance(latitude, longitude, parseFloat(apotek.latitude), parseFloat(apotek.longitude));
            const distMeter = distKm * 1000;

            const MAX_RADIUS_METERS = 150;
            if (distMeter > MAX_RADIUS_METERS) {
                await client.query('ROLLBACK');
                return res.status(400).json({ 
                    error: `Gagal Check-in! Anda berada di luar radius apotek (${Math.round(distMeter)}m). Maksimal jarak adalah ${MAX_RADIUS_METERS} meter.` 
                });
            }

            // 3. Simpan data kunjungan ke tabel visits (termasuk kolom foto)
            const currentTime = new Date().toTimeString().split(' ')[0];
            const visitInsert = `
                INSERT INTO visits (sales_id, pharmacy_id, tanggal, jam_checkin, latitude, longitude, catatan, foto)
                VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7)
                RETURNING id;
            `;
            const visitRes = await client.query(visitInsert, [salesId, pharmacy_id, currentTime, latitude, longitude, keterangan || '', fotoPath]);
            const visitId = visitRes.rows[0].id;

            // 4. Simpan aktivitas kunjungan (order / tidak_order / inkaso)
            const activityInsert = `
                INSERT INTO visit_activities (visit_id, activity, keterangan)
                VALUES ($1, $2, $3);
            `;
            await client.query(activityInsert, [visitId, activity, keterangan || '']);

            await client.query('COMMIT');
            return res.status(201).json({ message: 'Kunjungan berhasil dicatat!', visit_id: visitId });
        } catch (error) {
            await client.query('ROLLBACK');
            return res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    }
}

// Fungsi rumus Haversine untuk menghitung jarak GPS (dalam Kilometer)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

module.exports = VisitController;