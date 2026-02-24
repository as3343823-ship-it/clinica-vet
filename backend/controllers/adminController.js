const { listUsuarios } = require('../services/adminService');

const handleListarUsuarios = async (req, res) => {
  if (req.user.nivel !== 'administrador') return res.status(403).send('Acesso negado');

  try {
    const usuarios = await listUsuarios();
    return res.json(usuarios);
  } catch (error) {
    return res.status(500).send('Erro ao listar usuários');
  }
};

module.exports = { handleListarUsuarios };
