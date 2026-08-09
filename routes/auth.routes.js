const express = require('express');
const AuthController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', AuthController.login);
router.get('/me', verifyToken, AuthController.me);
router.post('/logout', verifyToken, AuthController.logout);

module.exports = router;