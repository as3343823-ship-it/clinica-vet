const db = require('../config/db');
const { classificarPrioridade } = require('../utils/classificador');

const queryAsync = (sql, params) => new Promise((resolve, reject) => db.query(sql, params, (err, results) => err ? reject(err) : resolve(results)));

const cadastrarAnimal = async ({ nome, idade, especie, sexo, peso, sintomas, gravidade }, tutorId, imagemPath) => {
  const classif = classificarPrioridade(parseInt(idade), especie, parseInt(gravidade));
  await queryAsync('INSERT INTO animais (nome, idade, especie, sexo, peso, sintomas, classif, tutor_id, imagem_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [nome, parseInt(idade), especie, sexo, parseFloat(peso), sintomas, classif, tutorId, imagemPath]);
};

const listarAnimaisPorTutor = async (tutorId) => await queryAsync('SELECT * FROM animais WHERE tutor_id = ?', [tutorId]);

const darAltaAnimal = async (nome) => {
  const [animal] = await queryAsync('SELECT id FROM animais WHERE nome = ?', [nome]);
  if (!animal) throw 'Não encontrado';
  await queryAsync('DELETE FROM animais WHERE id = ?', [animal.id]);
};

module.exports = { cadastrarAnimal, listarAnimaisPorTutor, darAltaAnimal };