const pool = require('../database/db');

class ProductService {
    static async getAllProducts() {
        const query = `
            SELECT 
                id, 
                nama_produk AS name, 
                'obat_bebas' AS category, 
                'Obat Bebas' AS category_name, 
                harga AS price, 
                stok AS stock 
            FROM products 
            ORDER BY nama_produk ASC;
        `;
        const result = await pool.query(query);
        return result.rows;
    }
}

module.exports = ProductService;