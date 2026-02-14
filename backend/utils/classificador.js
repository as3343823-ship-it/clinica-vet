const { LISTA_ESPECIES_EXOTICAS } = require('../especies');

const classificarPrioridade = (idade, especie, gravidade) => {
  let pontos = 0;
  if (gravidade === 3) pontos += 3;
  else if (gravidade === 2) pontos += 1;
  if (idade < 1 || idade > 10) pontos += 1;
  if (LISTA_ESPECIES_EXOTICAS.includes(especie)) pontos += 1;
  return pontos >= 4 ? 'D' : pontos >= 3 ? 'C' : pontos >= 1 ? 'B' : 'A';
};

module.exports = { classificarPrioridade };