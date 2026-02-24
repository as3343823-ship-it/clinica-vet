class Exame {
  constructor(id, tipo, resultados, data, realizado, animalId) {
    this.id = id;
    this.tipo = tipo;
    this.resultados = resultados;
    this.data = data;
    this.realizado = realizado;
    this.animalId = animalId;
  }
}

module.exports = Exame;
