const bcrypt = require('bcryptjs');
const { 
  loginFuncionario, 
  loginTutor, 
  cadastrarTutor, 
  getUserById, 
  updateSenha 
} = require('../services/authService');

const handleLoginFuncionario = async (req, res) => {
  try {
    const { token } = await loginFuncionario(req.body.username, req.body.senha);
    res.cookie('jwt', token, { httpOnly: true, secure: false, maxAge: 3600000 });
    res.redirect('/menu-funcionario');
  } catch (error) {
    res.render('login_funcionario', { error: error || 'Credenciais inválidas' });
  }
};

const handleLoginTutor = async (req, res) => {
  try {
    const { token } = await loginTutor(req.body.email, req.body.senha);
    res.cookie('jwt', token, { httpOnly: true, secure: false, maxAge: 3600000 });
    res.redirect('/menu-cliente');
  } catch (error) {
    res.render('login_cliente', { error: error || 'Credenciais inválidas' });
  }
};

const handleCadastrarTutor = async (req, res) => {
  try {
    await cadastrarTutor(req.body);
    res.redirect('/auth/login-tutor');
  } catch (error) {
    res.render('cadastro_tutor', { error: error || 'Erro ao cadastrar' });
  }
};

const handleAlterarSenha = async (req, res) => {
  const { senhaAtual, senhaNova } = req.body;

  try {
    const user = await getUserById(req.user.tipo, req.user.id);
    if (!user || !bcrypt.compareSync(senhaAtual, user.senha_hash)) {
      throw 'Senha atual inválida';
    }

    const novoHash = bcrypt.hashSync(senhaNova, 10);
    await updateSenha(req.user.tipo, user.id, novoHash);

    res.redirect('/auth/perfil');
  } catch (error) {
    res.render('alterar_senha', { user: req.user, error: error || 'Erro ao alterar senha' });
  }
};

const handleVerPerfil = async (req, res) => {
  const user = await getUserById(req.user.tipo, req.user.id);
  const profile = user ? { ...req.user, ...user } : req.user;
  res.render('perfil', { user: profile, error: null });
};

const handleEditarPerfil = async (req, res) => {
  try {
    const user = await getUserById(req.user.tipo, req.user.id);
    if (!user) throw new Error('Usuário não encontrado');
    const { nome } = req.body;
    if (req.user.tipo === 'tutor' && nome) {
      const db = require('../config/db');
      const queryAsync = (sql, params) => new Promise((resolve, reject) => {
        db.query(sql, params, (err, r) => (err ? reject(err) : resolve(r)));
      });
      await queryAsync('UPDATE tutores SET nome = ? WHERE id = ?', [nome, req.user.id]);
    }
    res.redirect('/auth/perfil');
  } catch (error) {
    const profile = await getUserById(req.user.tipo, req.user.id).catch(() => req.user);
    res.render('perfil', { user: profile || req.user, error: error || 'Erro ao atualizar perfil' });
  }
};

module.exports = {
  handleLoginFuncionario,
  handleLoginTutor,
  handleCadastrarTutor,
  handleAlterarSenha,
  handleVerPerfil,
  handleEditarPerfil
};
