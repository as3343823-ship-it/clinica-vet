const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-seguro-aqui';

const queryAsync = (sql, params = []) => new Promise((resolve, reject) => {
  db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)));
});

const loginFuncionario = async (username, senha) => {
  const [user] = await queryAsync('SELECT * FROM usuarios WHERE username = ?', [username]);

  if (!user || !bcrypt.compareSync(senha, user.senha_hash)) {
    throw 'Credenciais inválidas';
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, nivel: user.nivel, tipo: 'funcionario' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { token, user };
};

const loginTutor = async (email, senha) => {
  const [tutor] = await queryAsync('SELECT * FROM tutores WHERE email = ?', [email]);

  if (!tutor || !bcrypt.compareSync(senha, tutor.senha_hash)) {
    throw 'Credenciais inválidas';
  }

  const token = jwt.sign(
    { id: tutor.id, email: tutor.email, nome: tutor.nome, tipo: 'tutor' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { token, tutor };
};

const loginUnificado = async (login, senha) => {
  try {
    return await loginFuncionario(login, senha);
  } catch (_) {
    return loginTutor(login, senha);
  }
};

const cadastrarTutor = async ({ nome, email, telefone, genero, morada, password }) => {
  if (!nome || !email || !password) {
    throw 'Preencha nome, email e senha';
  }

  const senhaHash = bcrypt.hashSync(password, 10);

  try {
    await queryAsync(
      'INSERT INTO tutores (nome, email, telefone, genero, morada, senha_hash) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, email, telefone || null, genero || null, morada || null, senhaHash]
    );
  } catch (err) {
    throw err.code === 'ER_DUP_ENTRY' ? 'Este email já está cadastrado' : 'Erro ao cadastrar';
  }
};

const getUserById = async (tipo, id) => {
  const table = tipo === 'funcionario' ? 'usuarios' : 'tutores';
  const [row] = await queryAsync(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  return row || null;
};

const updateSenha = async (tipo, id, senhaHash) => {
  const table = tipo === 'funcionario' ? 'usuarios' : 'tutores';
  await queryAsync(`UPDATE ${table} SET senha_hash = ? WHERE id = ?`, [senhaHash, id]);
};

module.exports = {
  loginFuncionario,
  loginTutor,
  loginUnificado,
  cadastrarTutor,
  getUserById,
  updateSenha,
  queryAsync
};
