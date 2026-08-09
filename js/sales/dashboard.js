document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('userName').textContent = `Halo, ${user.nama}`;
        // Update avatar inisial jika ada elemennya
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar && user.nama) {
            const initials = user.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            userAvatar.textContent = initials;
        }
    }

    try {
        const data = await apiRequest('/sales/dashboard');
        
        // Menyesuaikan dengan struktur data yang dikembalikan backend Anda
        // Pastikan menangani properti apakah langsung dari object atau dibungkus dalam 'target'
        const progressOrderEl = document.getElementById('progressOrder');
        const visitTodayEl = document.getElementById('visitToday');
        
        if (data.target) {
            progressOrderEl.textContent = `${data.target.order_aktual || 0} / ${data.target.target_order || 0}`;
            visitTodayEl.textContent = data.target.kunjungan_hari_ini || 0;
        } else {
            // Fallback jika format langsung dari root object
            progressOrderEl.textContent = data.progressOrder || '0 / 0';
            visitTodayEl.textContent = data.kunjunganHariIni || 0;
        }

        const historyContainer = document.getElementById('historyList');
        const riwayatList = data.riwayat_kunjungan || data.riwayatKunjungan || [];

        if (riwayatList.length === 0) {
            historyContainer.innerHTML = '<p class="empty-text">Belum ada riwayat kunjungan.</p>';
        } else {
            historyContainer.innerHTML = riwayatList.map(v => `
                <div style="background:#fff; padding:1rem; border-radius:var(--radius-md); margin-bottom:0.75rem; border:1px solid var(--border-color); box-shadow:var(--shadow-card);">
                    <div style="font-weight:700; color:var(--text-main);">${v.nama_apotek || 'Apotek'}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.5rem;">${v.alamat || ''}</div>
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; align-items:center;">
                        <span style="background:#e0f2fe; color:#0369a1; padding:0.2rem 0.5rem; border-radius:4px; font-weight:600;">${(v.activity || 'Kunjungan').toUpperCase()}</span>
                        <span style="color:var(--text-muted);">${v.jam_checkin ? `Jam: ${v.jam_checkin}` : new Date(v.created_at).toLocaleString('id-ID')}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Gagal memuat dashboard:', err);
        const historyContainer = document.getElementById('historyList');
        if (historyContainer) {
            historyContainer.innerHTML = '<p class="empty-text" style="color:var(--danger);">Gagal memuat data riwayat kunjungan.</p>';
        }
    }
});