const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const JWT_SECRET = 'seu-secret-super-seguro-aqui';

const queryAsync = (sql, params) => new Promise((resolve, reject) => db.query(sql, params, (err, results) => err ? reject(err) : resolve(results)));

const loginFuncionario = async (username, senha) => {
  const [user] = await queryAsync('SELECT * FROM usuarios WHERE username = ?', [username]);
  if (!user || !bcrypt.compareSync(senha, user.senha_hash)) throw 'Credenciais inválidas';
  const token = jwt.sign({ id: user.id, username: user.username, nivel: user.nivel, tipo: 'funcionario' }, JWT_SECRET, { expiresIn: '1h' });
  return { token };
};

const loginTutor = async (email, senha) => {
  const [tutor] = await queryAsync('SELECT * FROM tutores WHERE email = ?', [email]);
  if (!tutor || !bcrypt.compareSync(senha, tutor.senha_hash)) throw 'Credenciais inválidas';
  const token = jwt.sign({ id: tutor.id, email: tutor.email, tipo: 'tutor' }, JWT_SECRET, { expiresIn: '1h' });
  return { token };
};

const cadastrarTutor = async ({ nome, email, telefone, genero, morada, password }) => {
  const senhaHash = bcrypt.hashSync(password, 10);
  try {
    await queryAsync('INSERT INTO tutores (nome, email, telefone, genero, morada, senha_hash) VALUES (?, ?, ?, ?, ?, ?)', [nome, email, telefone, genero, morada, senhaHash]);
  } catch (err) {
    throw err.code === 'ER_DUP_ENTRY' ? 'Email já cadastrado' : 'Erro no servidor';
  }
};



module.exports = { loginFuncionario, loginTutor, cadastrarTutor };