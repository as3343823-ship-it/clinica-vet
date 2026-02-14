const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { handleListarUsuarios, handleCriarUsuario, handleEditarUsuario, handleResetSenha, handleAtivarDesativar } = require('../controllers/adminController');

router.get('/listar-usuarios', verifyJWT, handleListarUsuarios);
router.post('/criar-usuario', verifyJWT, handleCriarUsuario);
router.post('/editar-usuario/:id', verifyJWT, handleEditarUsuario);
router.post('/reset-senha/:id', verifyJWT, handleResetSenha);
router.post('/ativar-desativar/:id', verifyJWT, handleAtivarDesativar);

router.get('/criar-funcionario', verifyJWT, (req, res) => {
  if (req.user.nivel !== 'administrador') return res.status(403).send('Acesso proibido');
  res.render('admin_criar_funcionario', { error: null });
});

router.post('/criar-funcionario', verifyJWT, (req, res) => {
  if (req.user.nivel !== 'administrador') return res.status(403).send('Acesso proibido');
  const { username, senha, nivel } = req.body;
  const senhaHash = bcrypt.hashSync(senha, 10);
  db.query('INSERT INTO usuarios (username, senha_hash, nivel) VALUES (?, ?, ?)', [username, senhaHash, nivel], (err) => {
    if (err) return res.render('admin_criar_funcionario', { error: 'Erro ao criar usuário' });
    res.redirect('/menu-funcionario');
  });
});

module.exports = router;