class ProntuarioClinico {
  constructor({ animal, historico, exames, alertas, alergias, crescimento, protocolos }) {
    this.animal = animal;
    this.historico = historico;
    this.exames = exames;
    this.alertas = alertas;
    this.alergias = alergias;
    this.crescimento = crescimento;
    this.protocolos = protocolos;
  }
}

module.exports = ProntuarioClinico;
