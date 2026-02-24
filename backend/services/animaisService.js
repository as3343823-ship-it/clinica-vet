const db = require('../config/db');
const { classificarPrioridade, gerarPontuarioPorClassificacao } = require('../utils/classificador');

const queryAsync = (sql, params = []) => new Promise((resolve, reject) => db.query(sql, params, (err, results) => err ? reject(err) : resolve(results)));

const validarTutorExiste = async (tutorId) => {
  const tutores = await queryAsync('SELECT id FROM tutores WHERE id = ?', [tutorId]);
  return tutores.length > 0;
};

const anexarPontuario = (animais) => animais.map((animal) => ({
  ...animal,
  pontuario: gerarPontuarioPorClassificacao(animal.classif)
}));

const cadastrarAnimal = async ({ nome, idade, especie, sexo, peso, sintomas, gravidade }, tutorId, imagemPath) => {
  const classif = classificarPrioridade(parseInt(idade, 10), especie, parseInt(gravidade, 10));
  await queryAsync(
    'INSERT INTO animais (nome, idade, especie, sexo, peso, sintomas, classif, tutor_id, imagem_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [nome, parseInt(idade, 10), especie, sexo, parseFloat(peso), sintomas, classif, tutorId, imagemPath]
  );
};

const listarAnimaisPorTutor = async (tutorId) => {
  const resultados = await queryAsync(
    `SELECT a.*, t.nome AS tutor_nome, t.email AS tutor_email
     FROM animais a
     JOIN tutores t ON t.id = a.tutor_id
     WHERE a.tutor_id = ?
     ORDER BY a.id DESC`,
    [tutorId]
  );

  return anexarPontuario(resultados);
};

const listarTodosAnimais = async () => {
  const resultados = await queryAsync(
    `SELECT a.*, t.nome AS tutor_nome, t.email AS tutor_email
     FROM animais a
     JOIN tutores t ON t.id = a.tutor_id
     ORDER BY FIELD(a.classif, 'D', 'C', 'B', 'A'), a.id DESC`
  );

  return anexarPontuario(resultados);
};

const buscarAnimalPorId = async (animalId) => {
  const results = await queryAsync(
    `SELECT a.*, t.nome AS tutor_nome, t.email AS tutor_email, t.telefone AS tutor_telefone
     FROM animais a
     JOIN tutores t ON t.id = a.tutor_id
     WHERE a.id = ?`,
    [animalId]
  );

  if (!results[0]) return null;
  return {
    ...results[0],
    pontuario: gerarPontuarioPorClassificacao(results[0].classif)
  };
};

const darAltaAnimal = async (animalId) => {
  const result = await queryAsync('DELETE FROM animais WHERE id = ?', [animalId]);
  if (!result.affectedRows) throw new Error('Animal não encontrado');
};

const listarPontuarios = async () => {
  const animais = await queryAsync('SELECT id, nome, classif, tutor_id FROM animais');
  return animais
    .map((animal) => ({
      ...animal,
      pontuario: gerarPontuarioPorClassificacao(animal.classif)
    }))
    .sort((a, b) => b.pontuario - a.pontuario);
};

module.exports = {
  cadastrarAnimal,
  listarAnimaisPorTutor,
  listarTodosAnimais,
  buscarAnimalPorId,
  validarTutorExiste,
  darAltaAnimal,
  listarPontuarios
};
