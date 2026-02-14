const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { handleAgendarTratamento, handleAgendarExame, handleListarAgendamentos, handleVerAgenda } = require('../controllers/agendaController');

router.post('/agendar-tratamento', verifyJWT, handleAgendarTratamento);
router.post('/agendar-exame', verifyJWT, handleAgendarExame);
router.get('/listar-agendamentos', verifyJWT, handleListarAgendamentos);
router.get('/ver-agenda', verifyJWT, handleVerAgenda);

module.exports = router;