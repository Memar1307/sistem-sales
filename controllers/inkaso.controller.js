const InkasoService = require('../services/inkaso.service');

class InkasoController {
    static async getInvoices(req, res) {
        try {
            const { pharmacyId } = req.params;
            const data = await InkasoService.getInvoicesByPharmacy(pharmacyId);
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async createInkaso(req, res) {
        try {
            const salesId = req.user.id;
            const { pharmacy_id, invoice_id, nominal, metode_pembayaran, catatan } = req.body;
            
            const result = await InkasoService.saveInkaso({
                salesId,
                pharmacy_id,
                invoice_id,
                nominal,
                metode_pembayaran,
                catatan
            });

            return res.status(200).json({ message: 'Inkaso berhasil disimpan', result });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = InkasoController;