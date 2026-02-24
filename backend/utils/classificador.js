const { LISTA_ESPECIES_EXOTICAS } = require('../especies');

const classificarPrioridade = (idade, especie, gravidade) => {
  let pontos = 0;
  if (gravidade === 3) pontos += 3;
  else if (gravidade === 2) pontos += 1;
  if (idade < 1 || idade > 10) pontos += 1;
  if (LISTA_ESPECIES_EXOTICAS.includes(especie)) pontos += 1;

  // D = mais urgente | A = menos urgente
  return pontos >= 4 ? 'D' : pontos >= 3 ? 'C' : pontos >= 1 ? 'B' : 'A';
};

const gerarPontuarioPorClassificacao = (classif) => {
  const tabela = { D: 100, C: 75, B: 50, A: 25 };
  return tabela[classif] || 0;
};

const gerarPontuarioAnimal = (idade, especie, gravidade) => {
  const classif = classificarPrioridade(idade, especie, gravidade);
  return gerarPontuarioPorClassificacao(classif);
};

module.exports = {
  classificarPrioridade,
  gerarPontuarioPorClassificacao,
  gerarPontuarioAnimal
};
