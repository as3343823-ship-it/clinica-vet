const { listUsuarios, criarUsuario, editarUsuario, resetSenha, ativarDesativar } = require('../services/adminService');

const handleListarUsuarios = async (req, res) => {
  if (req.user.nivel !== 'administrador') return res.status(403).send('Acesso negado');
  const usuarios = await listUsuarios();
  res.render('admin_usuarios', { usuarios });
};

// Similar para criar/editar/reset/ativar (use bcrypt.hashSync para senhas)