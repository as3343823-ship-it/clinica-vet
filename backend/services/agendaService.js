const db = require('../config/db');

const queryAsync = (sql, params) => new Promise((resolve, reject) => db.query(sql, params, (err, results) => err ? reject(err) : resolve(results)));

const agendarTratamento = async ({ tipo, descricao, data, animalId }) => {
  await queryAsync('INSERT INTO tratamentos (tipo, descricao, data, animal_id) VALUES (?, ?, ?, ?)', [tipo, descricao, data, animalId]);
};

const agendarExame = async ({ tipo, resultados, data, animalId }) => {
  await queryAsync('INSERT INTO exames (tipo, resultados, data, animal_id) VALUES (?, ?, ?, ?)', [tipo, resultados, data, animalId]);
};

const listarAgendamentos = async () => {
  const tratamentos = await queryAsync('SELECT * FROM tratamentos JOIN animais ON tratamentos.animal_id = animais.id');
  const exames = await queryAsync('SELECT * FROM exames JOIN animais ON exames.animal_id = animais.id');
  return { tratamentos, exames };
};

const verAgendaTutor = async (tutorId) => {
  return await queryAsync('SELECT * FROM animais WHERE tutor_id = ?', [tutorId]);
};

module.exports = { agendarTratamento, agendarExame, listarAgendamentos, verAgendaTutor };