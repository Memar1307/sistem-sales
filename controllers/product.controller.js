class ProductController {
    static async getProducts(req, res) {
        try {
            // Simulasi data produk (atau ambil dari Service / Database)
            const productsData = [
                { id: 1, name: 'Paracetamol 500mg Tablet', category: 'obat_bebas', category_name: 'Obat Bebas', price: 5500, stock: 120 },
                { id: 2, name: 'Amoxicillin 500mg Kapsul', category: 'obat_keras', category_name: 'Obat Keras', price: 12000, stock: 45 },
                { id: 3, name: 'Vitamin C 1000mg Effervescent', category: 'suplemen', category_name: 'Suplemen & Vitamin', price: 45000, stock: 30 },
                { id: 4, name: 'Masker Medis 3 Ply (Box isi 50)', category: 'alkes', category_name: 'Alat Kesehatan', price: 25000, stock: 0 },
                { id: 5, name: 'Ibuprofen 400mg Tablet', category: 'obat_bebas', category_name: 'Obat Bebas', price: 8500, stock: 85 }
            ];

            return res.status(200).json({
                status: 'success',
                data: productsData
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async getSubstitutes(req, res) {
        try {
            const productId = parseInt(req.params.id);
            const productsData = [
                { id: 1, name: 'Paracetamol 500mg Tablet', category: 'obat_bebas', category_name: 'Obat Bebas', price: 5500, stock: 120 },
                { id: 2, name: 'Amoxicillin 500mg Kapsul', category: 'obat_keras', category_name: 'Obat Keras', price: 12000, stock: 45 },
                { id: 3, name: 'Vitamin C 1000mg Effervescent', category: 'suplemen', category_name: 'Suplemen & Vitamin', price: 45000, stock: 30 },
                { id: 4, name: 'Masker Medis 3 Ply (Box isi 50)', category: 'alkes', category_name: 'Alat Kesehatan', price: 25000, stock: 0 },
                { id: 5, name: 'Ibuprofen 400mg Tablet', category: 'obat_bebas', category_name: 'Obat Bebas', price: 8500, stock: 85 }
            ];

            const targetProduct = productsData.find(p => p.id === productId);
            if (!targetProduct) {
                return res.status(200).json({ status: 'success', data: [] });
            }

            const substitutes = productsData.filter(p => p.category === targetProduct.category && p.id !== productId);

            return res.status(200).json({
                status: 'success',
                data: substitutes
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ProductController;