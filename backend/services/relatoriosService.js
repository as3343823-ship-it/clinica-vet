const db = require('../config/db');

const queryAsync = (sql, params) => new Promise((resolve, reject) => db.query(sql, params, (err, results) => err ? reject(err) : resolve(results)));

const gerarRelatorios = async () => {
  const [total] = await queryAsync('SELECT COUNT(*) AS total FROM animais');
  const classifCount = await queryAsync('SELECT classif, COUNT(*) AS count FROM animais GROUP BY classif');
  return { total: total.total, classifCount };
};

const sistemaManchester = async () => await queryAsync('SELECT * FROM animais ORDER BY classif DESC');

module.exports = { gerarRelatorios, sistemaManchester };