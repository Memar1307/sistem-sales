document.addEventListener('DOMContentLoaded', async () => {
    const pharmacySelect = document.getElementById('pharmacySelect');
    const invoiceContainer = document.getElementById('invoiceContainer');
    const selectedInvoiceId = document.getElementById('selectedInvoiceId');
    const nominalInput = document.getElementById('nominalInput');
    const inkasoForm = document.getElementById('inkasoForm');
    const submitBtn = document.getElementById('submitBtn');

    // 1. Muat daftar apotek
    try {
        const pharmacies = await apiRequest('/visits/pharmacies');
        pharmacySelect.innerHTML = '<option value="">-- Pilih Apotek --</option>';
        pharmacies.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.nama_apotek} (${p.alamat})`;
            pharmacySelect.appendChild(opt);
        });
    } catch (err) {
        pharmacySelect.innerHTML = '<option value="">Gagal memuat apotek</option>';
        console.error(err);
    }

    // 2. Ketika apotek dipilih, ambil daftar tagihan / invoice miliknya
    pharmacySelect.addEventListener('change', async (e) => {
        const pharmacyId = e.target.value;
        selectedInvoiceId.value = '';
        nominalInput.value = '';

        if (!pharmacyId) {
            invoiceContainer.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; margin: 0;">Silakan pilih apotek terlebih dahulu.</p>';
            return;
        }

        invoiceContainer.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; margin: 0;">Memuat tagihan...</p>';

        try {
            const invoices = await apiRequest(`/sales/invoices/${pharmacyId}`);

            if (!invoices || invoices.length === 0) {
                invoiceContainer.innerHTML = '<p style="font-size: 0.85rem; color: var(--danger); text-align: center; margin: 0;">Tidak ada tagihan aktif untuk apotek ini.</p>';
                return;
            }

            invoiceContainer.innerHTML = invoices.map(inv => `
                <div class="invoice-card-item" data-id="${inv.id}" data-amount="${inv.sisa_tagihan || inv.total}" style="background:#fff; padding:0.75rem; border-radius:6px; margin-bottom:0.5rem; border:1px solid var(--border-color); cursor:pointer; transition:all 0.2s;">
                    <div style="display:flex; justify-content:space-between; font-weight:600; font-size:0.85rem;">
                        <span>No. Faktur: ${inv.nomor_faktur || inv.id}</span>
                        <span style="color:var(--primary);">Rp ${(inv.sisa_tagihan || inv.total).toLocaleString('id-ID')}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem; font-size:0.75rem;">
                        <span style="color:var(--text-muted);">Jatuh Tempo: ${inv.jatuh_tempo ? new Date(inv.jatuh_tempo).toLocaleDateString('id-ID') : '-'}</span>
                        <span style="padding: 2px 6px; border-radius: 4px; font-weight: 600; background: ${inv.status_label === 'Lunas' ? '#d1fae5; color: #065f46;' : '#ffedd5; color: #9a3412;'};">
                            ${inv.status_label || 'Belum Lunas'}
                        </span>
                    </div>
                </div>
            `).join('');

            // Tambahkan event klik untuk memilih invoice
            document.querySelectorAll('.invoice-card-item').forEach(card => {
                card.addEventListener('click', () => {
                    document.querySelectorAll('.invoice-card-item').forEach(c => c.style.borderColor = 'var(--border-color)');
                    document.querySelectorAll('.invoice-card-item').forEach(c => c.style.background = '#fff');
                    
                    card.style.borderColor = 'var(--primary)';
                    card.style.background = '#f0f9ff';

                    selectedInvoiceId.value = card.getAttribute('data-id');
                    nominalInput.value = card.getAttribute('data-amount');
                });
            });

        } catch (err) {
            console.error(err);
            invoiceContainer.innerHTML = '<p style="font-size: 0.85rem; color: var(--danger); text-align: center; margin: 0;">Gagal memuat tagihan dari server.</p>';
        }
    });

    // 3. Submit Pembayaran Inkaso
    inkasoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const pharmacy_id = pharmacySelect.value;
        const invoice_id = selectedInvoiceId.value;
        const nominal = nominalInput.value;
        const metode = document.getElementById('metodeSelect').value;
        const catatan = document.getElementById('catatanInput').value;
        const fotoBukti = document.getElementById('fotoBukti');

        if (!invoice_id) {
            alert('Silakan klik dan pilih salah satu tagihan/invoice yang ingin dibayar.');
            return;
        }

        if (!fotoBukti.files || fotoBukti.files.length === 0) {
            alert('Anda wajib mengambil foto bukti pembayaran.');
            return;
        }

        submitBtn.textContent = 'Menyimpan Pembayaran...';
        submitBtn.disabled = true;

        try {
            const response = await apiRequest('/sales/inkaso', {
                method: 'POST',
                body: JSON.stringify({
                    pharmacy_id: parseInt(pharmacy_id),
                    invoice_id: parseInt(invoice_id),
                    nominal: parseFloat(nominal),
                    metode_pembayaran: metode,
                    catatan
                })
            });

            alert(response.message || 'Inkaso berhasil dibayar dan dicatat!');
            window.location.href = '/pages/sales/dashboard.html';
        } catch (err) {
            console.error('Error detail:', err);
            alert(err.message || 'Gagal menyimpan pembayaran inkaso.');
            submitBtn.textContent = 'Bayar Tagihan Inkaso';
            submitBtn.disabled = false;
        }
    });
});