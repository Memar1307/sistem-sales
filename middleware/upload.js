const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Cek apakah sedang berjalan di Vercel (Production)
const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';

// Tentukan lokasi penyimpanan: gunakan '/tmp' jika di Vercel, atau 'public/uploads' jika di lokal (komputer)
const uploadDir = isVercel ? '/tmp' : path.join(__dirname, '../public/uploads');

// Buat folder hanya jika bukan di Vercel (atau gunakan try-catch agar tidak crash)
try {
    if (!isVercel && !fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (err) {
    console.error('Gagal membuat folder upload:', err.message);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Batas ukuran file 5MB
});

module.exports = upload;