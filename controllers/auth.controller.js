const AuthService = require('../services/auth.service');

class AuthController {
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({ error: 'Username dan password wajib diisi' });
            }

            const result = await AuthService.login(username, password);
            return res.status(200).json({
                message: 'Login berhasil',
                ...result
            });
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    }

    static async me(req, res) {
        try {
            const userId = req.user.id;
            const user = await AuthService.getProfile(userId);
            return res.status(200).json({ user });
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }

    static async logout(req, res) {
        // Stateless JWT logout ditangani di client dengan menghapus token dari localStorage
        return res.status(200).json({ message: 'Logout berhasil' });
    }
}

module.exports = AuthController;