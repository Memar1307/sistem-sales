const db = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
    static async login(username, password) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await db.query(query, [username]);

        if (result.rows.length === 0) {
            throw new Error('Username atau password salah');
        }

        const user = result.rows[0];

        if (user.status !== 'aktif') {
            throw new Error('Akun Anda nonaktif, silakan hubungi administrator');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Username atau password salah');
        }

        // Payload JWT tanpa password
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
            nama: user.nama
        };

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                nama: user.nama,
                username: user.username,
                role: user.role,
                status: user.status,
                foto: user.foto
            }
        };
    }

    static async getProfile(userId) {
        const query = 'SELECT id, nama, username, role, status, foto, created_at FROM users WHERE id = $1';
        const result = await db.query(query, [userId]);

        if (result.rows.length === 0) {
            throw new Error('User tidak ditemukan');
        }

        return result.rows[0];
    }
}

module.exports = AuthService;