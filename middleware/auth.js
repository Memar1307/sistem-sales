const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token tidak ditemukan' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token tidak valid atau sudah kadaluarsa' });
        }
        req.user = user;
        next();
    });
}

function verifySalesRole(req, res, next) {
    if (req.user.role !== 'sales') {
        return res.status(403).json({ error: 'Akses ditolak khusus role sales' });
    }
    next();
}

module.exports = {
    verifyToken,
    verifySalesRole
};