const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '698223ana',  // Mude para a tua senha root se não for vazia
  database: 'clinica_vet'
});

connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar no MySQL:', err);
    return;
  }
  console.log('MySQL Connected');
});

module.exports = connection;