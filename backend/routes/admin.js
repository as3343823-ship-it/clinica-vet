const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const {
  handleListarUsuarios,
  handleCriarUsuario,
  handleEditarUsuario,
  handleResetSenha,
  handleAtivarDesativar
} = require('../controllers/adminController');

router.get('/listar-usuarios', verifyJWT, handleListarUsuarios);
router.get('/criar-funcionario', verifyJWT, handleListarUsuarios);

router.post('/criar-funcionario', verifyJWT, handleCriarUsuario);
router.post('/editar-usuario/:id', verifyJWT, handleEditarUsuario);
router.post('/reset-senha/:id', verifyJWT, handleResetSenha);
router.post('/ativar-desativar/:id', verifyJWT, handleAtivarDesativar);

module.exports = router;