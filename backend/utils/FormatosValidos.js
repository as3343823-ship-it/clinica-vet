/**
 * FormatosValidos - Classe para validar formatos de entrada (e-mail, telefone, etc.)
 * Garante que apenas domínios de e-mail aceites são permitidos
 */

const db = require('../config/db');

const queryAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

class FormatosValidos {
  /**
   * Regex base para e-mail (RFC 5322 simplificado)
   * local@domain.tld
   */
  static EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  /**
   * Domínios aceites por defeito (fallback se a tabela não existir ou estiver vazia)
   */
  static DOMINIOS_PADRAO = [
    'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com',
    'yahoo.com', 'yahoo.com.br', 'icloud.com', 'me.com', 'protonmail.com', 'proton.me',
    'alt.mail', 'zoho.com', 'uol.com.br', 'bol.com.br', 'terra.com.br', 'ig.com.br'
  ];

  /**
   * Valida se o e-mail tem formato válido
   * @param {string} email
   * @returns {{ valido: boolean, mensagem?: string }}
   */
  static validarFormatoEmail(email) {
    if (!email || typeof email !== 'string') {
      return { valido: false, mensagem: 'E-mail é obrigatório.' };
    }
    const trimmed = email.trim().toLowerCase();
    if (trimmed.length < 5) {
      return { valido: false, mensagem: 'E-mail inválido.' };
    }
    if (!FormatosValidos.EMAIL_REGEX.test(trimmed)) {
      return { valido: false, mensagem: 'Formato de e-mail inválido.' };
    }
    return { valido: true };
  }

  /**
   * Extrai o domínio do e-mail (parte após @)
   * @param {string} email
   * @returns {string}
   */
  static extrairDominio(email) {
    if (!email || !email.includes('@')) return '';
    return email.trim().toLowerCase().split('@')[1];
  }

  /**
   * Verifica se o domínio está na lista de permitidos (na base de dados)
   * @param {string} dominio
   * @returns {Promise<boolean>}
   */
  static async dominioPermitido(dominio) {
    try {
      const rows = await queryAsync(
        'SELECT 1 FROM dominios_email_permitidos WHERE LOWER(dominio) = LOWER(?) AND ativo = 1',
        [dominio]
      );
      return rows && rows.length > 0;
    } catch {
      return FormatosValidos.DOMINIOS_PADRAO.some((d) => d === dominio.toLowerCase());
    }
  }

  /**
   * Valida e-mail completo: formato + domínio permitido
   * @param {string} email
   * @returns {Promise<{ valido: boolean, mensagem?: string }>}
   */
  static async validarEmail(email) {
    const formato = FormatosValidos.validarFormatoEmail(email);
    if (!formato.valido) return formato;

    const dominio = FormatosValidos.extrairDominio(email);
    if (!dominio) return { valido: false, mensagem: 'Domínio do e-mail inválido.' };

    const permitido = await FormatosValidos.dominioPermitido(dominio);
    if (!permitido) {
      return {
        valido: false,
        mensagem: `Domínio @${dominio} não é aceite. Utilize Gmail, Outlook, Yahoo, Alt.mail ou outros serviços suportados.`
      };
    }

    return { valido: true };
  }

  /**
   * Valida telefone (formato português/brasileiro simplificado)
   * @param {string} telefone
   * @returns {{ valido: boolean, mensagem?: string }}
   */
  static validarTelefone(telefone) {
    if (!telefone || typeof telefone !== 'string') return { valido: true };
    const digits = telefone.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 15) {
      return { valido: false, mensagem: 'Telefone deve ter entre 9 e 15 dígitos.' };
    }
    return { valido: true };
  }

  /**
   * Valida nome (não vazio, caracteres básicos)
   * @param {string} nome
   * @returns {{ valido: boolean, mensagem?: string }}
   */
  static validarNome(nome) {
    if (!nome || typeof nome !== 'string') {
      return { valido: false, mensagem: 'Nome é obrigatório.' };
    }
    const trimmed = nome.trim();
    if (trimmed.length < 2) {
      return { valido: false, mensagem: 'Nome deve ter pelo menos 2 caracteres.' };
    }
    if (!/^[\p{L}\s.'-]+$/u.test(trimmed)) {
      return { valido: false, mensagem: 'Nome contém caracteres inválidos.' };
    }
    return { valido: true };
  }
}

module.exports = { FormatosValidos };
