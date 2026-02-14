const db = require('../config/db');

const queryAsync = (sql, params) => new Promise((resolve, reject) => db.query(sql, params, (err, results) => err ? reject(err) : resolve(results)));

const listUsuarios = async () => await queryAsync('SELECT * FROM usuarios');

module.exports = { listUsuarios };