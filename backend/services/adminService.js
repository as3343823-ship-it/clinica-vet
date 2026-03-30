const bcrypt = require('bcryptjs');
const db = require('../config/db');

const queryAsync = (sql, params = []) => new Promise((resolve, reject) => {
  db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)));
});

const listUsuarios = async () => {
  try {
    return await queryAsync('SELECT id, username, nivel, ativo FROM usuarios ORDER BY id DESC');
  } catch {
    const rows = await queryAsync('SELECT id, username, nivel FROM usuarios ORDER BY id DESC');
    return rows.map((r) => ({ ...r, ativo: 1 }));
  }
};

const criarUsuario = async ({ username, senha, nivel }) => {
  if (!username || !senha || !nivel) {
    throw 'Preencha username, senha e nível';
  }

  const senhaHash = bcrypt.hashSync(senha, 10);
  await queryAsync('INSERT INTO usuarios (username, senha_hash, nivel) VALUES (?, ?, ?)', [username, senhaHash, nivel]);
};

const editarUsuario = async (id, { username, nivel }) => {
  if (!username || !nivel) throw 'Preencha username e nível';
  await queryAsync('UPDATE usuarios SET username = ?, nivel = ? WHERE id = ?', [username, nivel, id]);
};

const resetSenha = async (id, novaSenha = '123456') => {
  const senhaHash = bcrypt.hashSync(novaSenha, 10);
  await queryAsync('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [senhaHash, id]);
};

const ativarDesativar = async (id, ativo) => {
  await queryAsync('UPDATE usuarios SET ativo = ? WHERE id = ?', [ativo ? 1 : 0, id]);
};

module.exports = {
  listUsuarios,
  criarUsuario,
  editarUsuario,
  resetSenha,
  ativarDesativar
};
