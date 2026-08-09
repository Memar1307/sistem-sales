const express = require('express');
const ProductController = require('../controllers/product.controller');
const { verifyToken } = require('../middleware/auth'); // Sesuaikan middleware auth Anda[cite: 5]

const router = express.Router();

// Endpoint untuk mengambil daftar produk
router.get('/', verifyToken, ProductController.getProducts);

// Endpoint untuk produk substitusi
router.get('/:id/substitutes', verifyToken, ProductController.getSubstitutes);

module.exports = router;