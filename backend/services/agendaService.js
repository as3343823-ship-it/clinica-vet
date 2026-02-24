const db = require('../config/db');

const queryAsync = (sql, params = []) => new Promise((resolve, reject) => db.query(sql, params, (err, results) => err ? reject(err) : resolve(results)));

const agendarTratamento = async ({ tipo, descricao, data, animalId }) => {
  await queryAsync(
    'INSERT INTO tratamentos (tipo, descricao, data, animal_id) VALUES (?, ?, ?, ?)',
    [tipo, descricao, data, animalId]
  );
};

const agendarExame = async ({ tipo, resultados, data, animalId }) => {
  await queryAsync(
    'INSERT INTO exames (tipo, resultados, data, animal_id) VALUES (?, ?, ?, ?)',
    [tipo, resultados, data, animalId]
  );
};

const listarAnimaisParaAgendamento = async () => {
  return queryAsync(
    `SELECT a.id, a.nome, t.nome AS tutor_nome
     FROM animais a
     JOIN tutores t ON t.id = a.tutor_id
     ORDER BY a.nome ASC`
  );
};

const listarAgendamentos = async () => {
  const tratamentos = await queryAsync(
    `SELECT tr.id, tr.tipo, tr.descricao, tr.data, a.id AS animal_id, a.nome AS animal_nome,
            t.id AS tutor_id, t.nome AS tutor_nome
     FROM tratamentos tr
     JOIN animais a ON tr.animal_id = a.id
     JOIN tutores t ON a.tutor_id = t.id
     ORDER BY tr.data DESC, tr.id DESC`
  );

  const exames = await queryAsync(
    `SELECT ex.id, ex.tipo, ex.resultados, ex.data, a.id AS animal_id, a.nome AS animal_nome,
            t.id AS tutor_id, t.nome AS tutor_nome
     FROM exames ex
     JOIN animais a ON ex.animal_id = a.id
     JOIN tutores t ON a.tutor_id = t.id
     ORDER BY ex.data DESC, ex.id DESC`
  );

  return { tratamentos, exames };
};

const verAgendaTutor = async (tutorId) => {
  const tratamentos = await queryAsync(
    `SELECT tr.id, tr.tipo, tr.descricao, tr.data, a.nome AS animal_nome
     FROM tratamentos tr
     JOIN animais a ON tr.animal_id = a.id
     WHERE a.tutor_id = ?
     ORDER BY tr.data DESC, tr.id DESC`,
    [tutorId]
  );

  const exames = await queryAsync(
    `SELECT ex.id, ex.tipo, ex.resultados, ex.data, a.nome AS animal_nome
     FROM exames ex
     JOIN animais a ON ex.animal_id = a.id
     WHERE a.tutor_id = ?
     ORDER BY ex.data DESC, ex.id DESC`,
    [tutorId]
  );

  return { tratamentos, exames };
};

module.exports = {
  agendarTratamento,
  agendarExame,
  listarAnimaisParaAgendamento,
  listarAgendamentos,
  verAgendaTutor
};
