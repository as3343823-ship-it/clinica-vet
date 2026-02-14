const { gerarRelatorios, sistemaManchester } = require('../services/relatoriosService');

const handleGerarRelatorios = async (req, res) => {
  try {
    const { total, classifCount } = await gerarRelatorios();
    res.render('relatorios', { total, classifCount });
  } catch (error) {
    res.status(500).send('Erro');
  }
};

const handleSistemaManchester = async (req, res) => {
  try {
    const animais = await sistemaManchester();
    res.render('relatorios', { animais });
  } catch (error) {
    res.status(500).send('Erro');
  }
};

module.exports = { handleGerarRelatorios, handleSistemaManchester };