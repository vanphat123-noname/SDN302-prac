const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /auth/tokens
router.post('/tokens', authController.issueToken);

module.exports = router;
