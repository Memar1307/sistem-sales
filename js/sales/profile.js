document.addEventListener('DOMContentLoaded', async () => {
    const profileContainer = document.getElementById('profileContainer');
    const logoutBtn = document.getElementById('logoutBtn');

    // 1. Ambil Data Profil Pengguna dari API (/api/auth/me)
    async function loadProfile() {
        try {
            const response = await apiRequest('/auth/me'); 
            const user = response.user || response.data || {};
            const name = user.name || user.username || 'Sales Representative';
            
            // Buat Inisial untuk Avatar
            const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            
            // Perbarui avatar di header jika ada
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar) userAvatar.textContent = initials;

            if (profileContainer) {
                profileContainer.innerHTML = `
                    <div style="background: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e2e8f0;">
                        <!-- Banner Header Bergaya Modern -->
                        <div style="height: 110px; background: linear-gradient(135deg, #2563eb, #1d4ed8); position: relative;">
                            <div style="position: absolute; top: 12px; right: 12px; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(4px); padding: 4px 12px; border-radius: 20px; color: #ffffff; font-size: 0.75rem; font-weight: 600;">
                                Active Session
                            </div>
                        </div>
                        
                        <!-- Profile Body -->
                        <div style="padding: 0 1.5rem 1.5rem 1.5rem; text-align: center; position: relative;">
                            <!-- Avatar Melayang -->
                            <div style="width: 80px; height: 80px; background: #ffffff; border-radius: 50%; margin: -40px auto 12px auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 4px solid #ffffff; font-size: 1.5rem; font-weight: 700; color: #2563eb;">
                                ${initials}
                            </div>

                            <h2 style="font-size: 1.15rem; font-weight: 700; color: #1e3a8a; margin: 0 0 4px 0;">${name}</h2>
                            <p style="font-size: 0.85rem; color: #64748b; margin: 0 0 1rem 0;">@${user.username || 'sales_sfa'} • ${user.role || 'Sales Representative'}</p>
                            
                            <!-- Detail Info Card -->
                            <div style="background: #f8fafc; border-radius: 12px; padding: 0.85rem 1rem; border: 1px solid #e2e8f0; margin-bottom: 1.25rem; font-size: 0.85rem; color: #334155; text-align: left;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
                                    <span style="color: #64748b;">Email:</span>
                                    <span style="font-weight: 500; color: #1e3a8a;">${user.email || '-'}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: #64748b;">Wilayah:</span>
                                    <span style="font-weight: 500; color: #1e3a8a;">${user.territory || 'Jawa Tengah'}</span>
                                </div>
                            </div>

                            <!-- Statistik Kinerja Box -->
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: #eff6ff; padding: 0.85rem; border-radius: 12px; border: 1px solid #bfdbfe; text-align: center;">
                                <div>
                                    <div style="font-size: 1.05rem; font-weight: 700; color: #1e3a8a;">24</div>
                                    <div style="font-size: 0.68rem; color: #64748b; text-transform: uppercase; font-weight: 600; margin-top: 2px;">Kunjungan</div>
                                </div>
                                <div style="border-left: 1px solid #bfdbfe; border-right: 1px solid #bfdbfe;">
                                    <div style="font-size: 1.05rem; font-weight: 700; color: #1e3a8a;">18</div>
                                    <div style="font-size: 0.68rem; color: #64748b; text-transform: uppercase; font-weight: 600; margin-top: 2px;">Order</div>
                                </div>
                                <div>
                                    <div style="font-size: 1.05rem; font-weight: 700; color: #1e3a8a;">92%</div>
                                    <div style="font-size: 0.68rem; color: #64748b; text-transform: uppercase; font-weight: 600; margin-top: 2px;">Target</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        } catch (err) {
            console.error('Gagal mengambil profil:', err);
            if (profileContainer) {
                profileContainer.innerHTML = `
                    <div style="padding: 1rem; text-align: center; color: #991b1b; background: #fee2e2; border: 1px solid #fecaca; border-radius: 12px;">
                        <p style="font-size: 0.85rem; margin: 0;">Gagal memuat profil pengguna.</p>
                    </div>
                `;
            }
        }
    }

    // 2. Fungsi Tombol Log Out
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
                try {
                    await apiRequest('/auth/logout', 'POST');
                } catch (e) {}

                localStorage.removeItem('token');
                localStorage.clear();
                window.location.href = '/index.html'; 
            }
        });
    }

    loadProfile();
});