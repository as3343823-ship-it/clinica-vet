const {
  listUsuarios,
  criarUsuario,
  editarUsuario,
  resetSenha,
  ativarDesativar
} = require('../services/adminService');

const isAdmin = (req) => req.user?.tipo === 'funcionario' && req.user?.nivel === 'administrador';

const denyIfNotAdmin = (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).send('Acesso negado');
    return true;
  }

  return false;
};

const handleListarUsuarios = async (req, res) => {
  if (denyIfNotAdmin(req, res)) return;

  try {
    const usuarios = await listUsuarios();
    return res.render('admin_criar_funcionario', { error: null, usuarios });
  } catch (_) {
    return res.status(500).send('Erro ao listar usuários');
  }
};

const handleCriarUsuario = async (req, res) => {
  if (denyIfNotAdmin(req, res)) return;

  try {
    await criarUsuario(req.body);
    return res.redirect('/admin/listar-usuarios');
  } catch (error) {
    const usuarios = await listUsuarios().catch(() => []);
    return res.render('admin_criar_funcionario', { error, usuarios });
  }
};

const handleEditarUsuario = async (req, res) => {
  if (denyIfNotAdmin(req, res)) return;

  try {
    await editarUsuario(req.params.id, req.body);
    return res.redirect('/admin/listar-usuarios');
  } catch (_) {
    return res.status(400).send('Erro ao editar usuário');
  }
};

const handleResetSenha = async (req, res) => {
  if (denyIfNotAdmin(req, res)) return;

  try {
    await resetSenha(req.params.id, req.body?.senha || '123456');
    return res.redirect('/admin/listar-usuarios');
  } catch (_) {
    return res.status(400).send('Erro ao resetar senha');
  }
};

const handleAtivarDesativar = async (req, res) => {
  if (denyIfNotAdmin(req, res)) return;

  try {
    await ativarDesativar(req.params.id, req.body?.ativo === '1');
    return res.redirect('/admin/listar-usuarios');
  } catch (_) {
    return res.status(400).send('Erro ao atualizar status');
  }
};

module.exports = {
  handleListarUsuarios,
  handleCriarUsuario,
  handleEditarUsuario,
  handleResetSenha,
  handleAtivarDesativar
};
