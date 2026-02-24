const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { handleListarUsuarios } = require('../controllers/adminController');

router.get('/listar-usuarios', verifyJWT, handleListarUsuarios);

router.get('/criar-funcionario', verifyJWT, (req, res) => {
  if (req.user.nivel !== 'administrador') return res.status(403).send('Acesso proibido');
  return res.render('admin_criar_funcionario', { error: null });
});

router.post('/criar-funcionario', verifyJWT, (req, res) => {
  if (req.user.nivel !== 'administrador') return res.status(403).send('Acesso proibido');

  const { username, senha, nivel } = req.body;
  if (!username || !senha || !nivel) {
    return res.render('admin_criar_funcionario', { error: 'Preencha username, senha e nível' });
  }

  const senhaHash = bcrypt.hashSync(senha, 10);
  db.query('INSERT INTO usuarios (username, senha_hash, nivel) VALUES (?, ?, ?)', [username, senhaHash, nivel], (err) => {
    if (err) return res.render('admin_criar_funcionario', { error: 'Erro ao criar usuário' });
    return res.redirect('/menu-funcionario');
  });
});

module.exports = router;
