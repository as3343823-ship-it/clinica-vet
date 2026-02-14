class Tratamento {
  constructor(id, tipo, descricao, data, realizado, animalId) {
    this.id = id;
    this.tipo = tipo;
    this.descricao = descricao;
    this.data = data;
    this.realizado = realizado;
    this.animalId = animalId;
  }
}
module.exports = Tratamento;