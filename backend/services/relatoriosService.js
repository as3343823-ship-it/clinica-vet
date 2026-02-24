const db = require('../config/db');

const queryAsync = (sql, params = []) => new Promise((resolve, reject) => db.query(sql, params, (err, results) => err ? reject(err) : resolve(results)));

const gerarRelatorios = async () => {
  const [totalAnimais] = await queryAsync('SELECT COUNT(*) AS total FROM animais');
  const [totalTutores] = await queryAsync('SELECT COUNT(*) AS total FROM tutores');
  const [mediaPeso] = await queryAsync('SELECT ROUND(AVG(peso), 2) AS media FROM animais');

  const classifCount = await queryAsync(
    "SELECT classif, COUNT(*) AS count FROM animais GROUP BY classif ORDER BY FIELD(classif, 'D', 'C', 'B', 'A')"
  );

  const especiesCount = await queryAsync(
    'SELECT especie, COUNT(*) AS count FROM animais GROUP BY especie ORDER BY count DESC, especie ASC'
  );

  const topTutores = await queryAsync(
    `SELECT t.id, t.nome, t.email, COUNT(a.id) AS total_animais
     FROM tutores t
     LEFT JOIN animais a ON a.tutor_id = t.id
     GROUP BY t.id, t.nome, t.email
     ORDER BY total_animais DESC, t.nome ASC
     LIMIT 5`
  );

  const urgentes = await queryAsync(
    `SELECT a.id, a.nome, a.classif, t.nome AS tutor_nome
     FROM animais a
     JOIN tutores t ON t.id = a.tutor_id
     ORDER BY FIELD(a.classif, 'D', 'C', 'B', 'A'), a.id DESC
     LIMIT 10`
  );

  return {
    totalAnimais: totalAnimais.total,
    totalTutores: totalTutores.total,
    mediaPeso: mediaPeso.media || 0,
    classifCount,
    especiesCount,
    topTutores,
    urgentes
  };
};

const sistemaManchester = async () => {
  return queryAsync(
    `SELECT a.id, a.nome, a.classif, a.sintomas, t.nome AS tutor_nome
     FROM animais a
     JOIN tutores t ON t.id = a.tutor_id
     ORDER BY FIELD(a.classif, 'D', 'C', 'B', 'A'), a.id DESC`
  );
};

module.exports = { gerarRelatorios, sistemaManchester };
