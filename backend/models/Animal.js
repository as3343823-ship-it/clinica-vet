class Animal {
  constructor(id, nome, idade, especie, raca, sexo, peso, sintomas, vacinas, historico, classif, tutorId, imagemPath) {
    this.id = id;
    this.nome = nome;
    this.idade = idade;
    this.especie = especie;
    this.raca = raca;
    this.sexo = sexo;
    this.peso = peso;
    this.sintomas = sintomas;
    this.vacinas = vacinas;
    this.historico = historico;
    this.classif = classif;
    this.tutorId = tutorId;
    this.imagemPath = imagemPath;
  }
}
module.exports = Animal;