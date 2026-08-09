const express = require('express');
const cors = require('cors');
const path = require('path'); 

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Melayani file statis dari root direktori
app.use(express.static(path.join(__dirname, '../')));

// Tambahkan rute eksplisit untuk halaman utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Import Routes
const authRoutes = require('../routes/auth.routes');
const salesRoutes = require('../routes/sales.routes');
const visitRoutes = require('../routes/visit.routes');
const inkasoRoutes = require('../routes/inkaso.routes');
const productRoutes = require('../routes/product.routes');

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/sales', inkasoRoutes);
app.use('/api/products', productRoutes);

// Root endpoint untuk health check API
app.get('/api', (req, res) => {
    res.json({ status: 'API SFA PWA Distributor Farmasi Running Successfully' });
});

// Handler untuk Vercel / Local Development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
}

module.exports = app;