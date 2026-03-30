const ProntuarioClinico = require('../models/ProntuarioClinico');
const { buscarAnimalPorId } = require('./animaisService');
const db = require('../config/db');

const queryAsync = (sql, params) => new Promise((resolve, reject) => {
  db.query(sql, params, (err, r) => (err ? reject(err) : resolve(r)));
});

const buscarExamesPorAnimal = async (animalId) => {
  const rows = await queryAsync(
    'SELECT tipo, data, resultados FROM exames WHERE animal_id = ? ORDER BY data DESC LIMIT 10',
    [animalId]
  );
  return rows.map((r) => ({ tipo: r.tipo, data: r.data ? String(r.data).slice(0, 10) : '-', status: r.resultados ? 'Concluído' : 'Aguardando coleta' }));
};

const criarProntuarioPorAnimal = async (animalId) => {
  const animal = await buscarAnimalPorId(animalId);
  if (!animal) return null;
  const examesDb = await buscarExamesPorAnimal(animalId);
  const exames = examesDb.length ? examesDb : [
    { tipo: 'Hemograma completo', data: '-', status: 'Aguardando solicitação' },
    { tipo: 'Urina tipo 1', data: '-', status: 'Aguardando solicitação' }
  ];
  return new ProntuarioClinico({
    animal: {
      nome: animal.nome,
      especie: animal.especie,
      raca: animal.raca || '-',
      tutor: animal.tutor_nome || '-',
      pesoAtual: String(animal.peso || '-'),
      ultimoRetorno: '-'
    },
    historico: [{ data: new Date().toLocaleDateString('pt-BR'), evento: `Cadastro: ${animal.sintomas || '-'}` }],
    exames,
    alertas: { proximoRetorno: '-' },
    alergias: ['Nenhuma registrada'],
    crescimento: [{ periodo: 'Atual', peso: String(animal.peso || '-') }],
    protocolos: ['Acompanhamento geral']
  });
};

const criarProntuarioExemplo = () => new ProntuarioClinico({
  animal: {
    nome: 'Thor',
    especie: 'Canino',
    raca: 'Labrador',
    tutor: 'Mariana Souza',
    pesoAtual: '28.4',
    ultimoRetorno: '05/02/2026'
  },
  historico: [
    { data: '05/02/2026', evento: 'Consulta de retorno: melhora da dermatite, manter protocolo.' },
    { data: '20/01/2026', evento: 'Solicitados exames de sangue e urina por poliúria.' },
    { data: '10/12/2025', evento: 'Vacinação anual e avaliação nutricional.' }
  ],
  exames: [
    { tipo: 'Hemograma completo', data: '20/01/2026', status: 'Concluído' },
    { tipo: 'Raio-x torácico', data: '20/01/2026', status: 'Em análise' },
    { tipo: 'Urina tipo 1', data: '20/01/2026', status: 'Aguardando coleta' }
  ],
  alertas: { proximoRetorno: '19/02/2026' },
  alergias: ['Alergia a dipirona', 'Restrição a frango'],
  crescimento: [
    { periodo: 'Nov/2025', peso: '26.8' },
    { periodo: 'Dez/2025', peso: '27.2' },
    { periodo: 'Jan/2026', peso: '27.9' },
    { periodo: 'Fev/2026', peso: '28.4' }
  ],
  protocolos: ['Dermatite atópica', 'Dor aguda', 'Gastroenterite', 'Pós-operatório']
});

module.exports = { criarProntuarioExemplo, criarProntuarioPorAnimal };
