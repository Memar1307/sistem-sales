const { Pool } = require('pg');

// Helper untuk menyematkan explicit sslmode=verify-full guna mencegah warning dari pg versi baru
const ensureSslMode = (url) => {
    if (!url) return url;
    if (url.includes('sslmode=')) return url;
    return url.includes('?') ? `${url}&sslmode=verify-full` : `${url}?sslmode=verify-full`;
};

const defaultConn = process.env.DATABASE_URL;

// Konfigurasi pool multi-wilayah dengan fallback ke DATABASE_URL utama
const pools = {
    barat: new Pool({
        connectionString: ensureSslMode(process.env.DATABASE_URL_BARAT || defaultConn),
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }),
    timur: new Pool({
        connectionString: ensureSslMode(process.env.DATABASE_URL_TIMUR || defaultConn),
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }),
    utara: new Pool({
        connectionString: ensureSslMode(process.env.DATABASE_URL_UTARA || defaultConn),
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }),
    selatan: new Pool({
        connectionString: ensureSslMode(process.env.DATABASE_URL_SELATAN || defaultConn),
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
};

// Default pool untuk kompatibilitas fungsi lama
const defaultPool = pools.barat;

module.exports = {
    query: (text, params) => defaultPool.query(text, params),
    getClient: () => defaultPool.connect(),
    pool: defaultPool,
    pools,
    getPool: (region) => pools[region] || defaultPool
};