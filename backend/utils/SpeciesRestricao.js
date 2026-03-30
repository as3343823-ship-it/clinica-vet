/**
 * SpeciesRestricao - Classe para restringir peso e idade por espécie
 * Valida entradas de animais contra os limites configurados na tabela especies_config
 */

const db = require('../config/db');

const queryAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

class SpeciesRestricao {
  constructor(especie, pesoMin, pesoMax, idadeMin, idadeMax) {
    this.especie = especie;
    this.pesoMin = parseFloat(pesoMin) ?? 0;
    this.pesoMax = parseFloat(pesoMax) ?? 999;
    this.idadeMin = parseInt(idadeMin, 10) ?? 0;
    this.idadeMax = parseInt(idadeMax, 10) ?? 999;
  }

  /**
   * Valida peso contra os limites da espécie
   * @param {number} peso - Peso em kg
   * @returns {{ valido: boolean, mensagem?: string }}
   */
  validarPeso(peso) {
    const p = parseFloat(peso);
    if (isNaN(p) || p < 0) {
      return { valido: false, mensagem: 'Peso inválido. Informe um valor numérico positivo.' };
    }
    if (p < this.pesoMin) {
      return {
        valido: false,
        mensagem: `Peso mínimo para ${this.especie} é ${this.pesoMin} kg.`
      };
    }
    if (p > this.pesoMax) {
      return {
        valido: false,
        mensagem: `Peso máximo para ${this.especie} é ${this.pesoMax} kg.`
      };
    }
    return { valido: true };
  }

  /**
   * Valida idade contra os limites da espécie
   * @param {number} idade - Idade em anos
   * @returns {{ valido: boolean, mensagem?: string }}
   */
  validarIdade(idade) {
    const i = parseInt(idade, 10);
    if (isNaN(i) || i < 0) {
      return { valido: false, mensagem: 'Idade inválida. Informe um número inteiro não negativo.' };
    }
    if (i < this.idadeMin) {
      return {
        valido: false,
        mensagem: `Idade mínima para ${this.especie} é ${this.idadeMin} ano(s).`
      };
    }
    if (i > this.idadeMax) {
      return {
        valido: false,
        mensagem: `Idade máxima para ${this.especie} é ${this.idadeMax} ano(s).`
      };
    }
    return { valido: true };
  }

  /**
   * Valida peso e idade em conjunto
   * @param {number} peso - Peso em kg
   * @param {number} idade - Idade em anos
   * @returns {{ valido: boolean, erros: string[] }}
   */
  validar(peso, idade) {
    const erros = [];
    const rPeso = this.validarPeso(peso);
    const rIdade = this.validarIdade(idade);
    if (!rPeso.valido) erros.push(rPeso.mensagem);
    if (!rIdade.valido) erros.push(rIdade.mensagem);
    return {
      valido: erros.length === 0,
      erros
    };
  }

  /**
   * Carrega restrições da base de dados para uma espécie
   * @param {string} especie - Nome da espécie
   * @returns {Promise<SpeciesRestricao|null>}
   */
  static async carregarPorEspecie(especie) {
    const rows = await queryAsync(
      'SELECT especie, peso_min_kg, peso_max_kg, idade_min_anos, idade_max_anos FROM especies_config WHERE especie = ?',
      [especie]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return new SpeciesRestricao(
      r.especie,
      r.peso_min_kg,
      r.peso_max_kg,
      r.idade_min_anos,
      r.idade_max_anos
    );
  }

  /**
   * Valida peso e idade para uma espécie (método estático)
   * Se a espécie não existir em especies_config, usa limites genéricos
   * @param {string} especie
   * @param {number} peso
   * @param {number} idade
   * @returns {Promise<{ valido: boolean, erros: string[] }>}
   */
  static async validarAnimal(especie, peso, idade) {
    let restricao = await SpeciesRestricao.carregarPorEspecie(especie);
    if (!restricao) {
      restricao = new SpeciesRestricao(especie, 0, 2000, 0, 100);
    }
    return restricao.validar(peso, idade);
  }
}

module.exports = { SpeciesRestricao };
