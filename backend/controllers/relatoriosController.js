const { gerarRelatorios, sistemaManchester } = require('../services/relatoriosService');

const handleGerarRelatorios = async (req, res) => {
  if (req.user.tipo !== 'funcionario') return res.status(403).send('Acesso negado');

  try {
    const relatorio = await gerarRelatorios();
    return res.render('relatorios', { user: req.user, ...relatorio, animais: null });
  } catch (error) {
    return res.status(500).send('Erro ao gerar relatórios');
  }
};

const handleSistemaManchester = async (req, res) => {
  if (req.user.tipo !== 'funcionario') return res.status(403).send('Acesso negado');

  try {
    const animais = await sistemaManchester();
    return res.render('relatorios', {
      user: req.user,
      totalAnimais: null,
      totalTutores: null,
      mediaPeso: null,
      classifCount: null,
      especiesCount: null,
      topTutores: null,
      urgentes: null,
      animais
    });
  } catch (error) {
    return res.status(500).send('Erro ao carregar sistema Manchester');
  }
};

module.exports = { handleGerarRelatorios, handleSistemaManchester };
