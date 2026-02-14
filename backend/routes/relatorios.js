const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { handleGerarRelatorios, handleSistemaManchester } = require('../controllers/relatoriosController');

router.get('/gerar-relatorios', verifyJWT, handleGerarRelatorios);
router.get('/sistema-manchester', verifyJWT, handleSistemaManchester);

module.exports = router;