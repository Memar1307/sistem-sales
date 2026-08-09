document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorAlert = document.getElementById('errorAlert');

    // Cek jika sudah login dan token masih valid, arahkan langsung ke dashboard
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/pages/sales/dashboard.html';
        return;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorAlert.style.display = 'none';

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

                // Simpan token dan data user ke localStorage
                localStorage.setItem('token', result.accessToken);
                localStorage.setItem('refreshToken', result.refreshToken);
                localStorage.setItem('user', JSON.stringify(result.user));

                // Validasi role sales
                if (result.user.role === 'sales') {
                    window.location.href = '/pages/sales/dashboard.html';
                } else {
                    throw new Error('Akses khusus role sales');
                }

            } catch (err) {
                errorAlert.textContent = err.message;
                errorAlert.style.display = 'block';
            }
        });
    }
});