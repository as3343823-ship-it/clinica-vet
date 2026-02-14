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
    const user = await getUserById(req.user.id);
    if (!bcrypt.compareSync(senhaAtual, user.senha_hash)) {
      throw 'Senha atual inválida';
    }

    const novoHash = bcrypt.hashSync(senhaNova, 10);
    await updateSenha(user.id, novoHash);

    res.redirect('/perfil');
  } catch (error) {
    res.render('alterar_senha', { error: error || 'Erro ao alterar senha' });
  }
};

module.exports = { handleLoginFuncionario, handleLoginTutor, handleCadastrarTutor, handleAlterarSenha };