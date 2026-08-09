const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runSeed() {
    try {
        console.log('Menghubungkan ke database...');
        
        // Buat tabel jika belum ada
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                nama VARCHAR(100) NOT NULL,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'sales' CHECK (role IN ('sales')),
                status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
                foto TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Hapus atau reset user budi_sales agar bersih
        await pool.query(`DELETE FROM users WHERE username = 'budi_sales';`);

        // Generate hash bcrypt asli menggunakan environment lokal
        const hashedPassword = await bcrypt.hash('sales123', 10);

        // Insert user baru
        await pool.query(`
            INSERT INTO users (nama, username, password, role, status) 
            VALUES ($1, $2, $3, $4, $5);
        `, ['Budi Sales', 'budi_sales', hashedPassword, 'sales', 'aktif']);

        console.log('SUKSES! User budi_sales berhasil dibuat dengan hash lokal yang valid.');
        console.log('Password asli: sales123');
        process.exit(0);
    } catch (err) {
        console.error('ERROR saat seeding:', err.message);
        process.exit(1);
    }
}

runSeed();