document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorAlert = document.getElementById('errorAlert');
    const submitButton = loginForm ? loginForm.querySelector('button[type="submit"]') : null;

    // Cek jika sudah login dan token masih valid, arahkan langsung ke dashboard sesuai role[cite: 5]
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
        try {
            const user = JSON.parse(savedUser);
            const userRole = (user.role || '').toLowerCase();
            if (userRole === 'manager') {
                window.location.href = '/pages/manager/dashboard.html';
            } else {
                window.location.href = '/pages/sales/dashboard.html';
            }
            return;
        } catch (e) {
            localStorage.clear();
        }
    }

    if (loginForm) {
        let isSubmitting = false;

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isSubmitting) return;
            isSubmitting = true;

            if (errorAlert) {
                errorAlert.style.display = 'none';
            }
            if (submitButton) submitButton.disabled = true;

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Login gagal');
                }

                // Simpan token dan data user ke localStorage[cite: 5]
                localStorage.setItem('token', result.accessToken);
                localStorage.setItem('refreshToken', result.refreshToken);
                localStorage.setItem('user', JSON.stringify(result.user));

                // Ambil role secara aman dan ubah ke huruf kecil
                const userRole = (result.user?.role || result.role || '').toLowerCase();

                // Validasi role untuk manager atau sales[cite: 5]
                if (userRole === 'manager') {
                    window.location.href = '/pages/manager/dashboard.html';
                } else if (userRole === 'sales') {
                    window.location.href = '/pages/sales/dashboard.html';
                } else {
                    throw new Error(`Role "${userRole}" tidak memiliki akses ke aplikasi ini`);
                }

            } catch (err) {
                if (errorAlert) {
                    errorAlert.textContent = err.message;
                    errorAlert.style.display = 'block';
                } else {
                    alert(err.message);
                }
                isSubmitting = false;
                if (submitButton) submitButton.disabled = false;
            }
        });
    }
});