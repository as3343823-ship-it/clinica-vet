const { agendarTratamento, agendarExame, listarAgendamentos, verAgendaTutor } = require('../services/agendaService');

const handleAgendarTratamento = async (req, res) => {
  try {
    await agendarTratamento(req.body);
    res.send('Tratamento agendado');
  } catch (error) {
    res.status(500).send('Erro');
  }
};

const handleAgendarExame = async (req, res) => {
  try {
    await agendarExame(req.body);
    res.send('Exame agendado');
  } catch (error) {
    res.status(500).send('Erro');
  }
};

const handleListarAgendamentos = async (req, res) => {
  try {
    const { tratamentos, exames } = await listarAgendamentos();
    res.render('menu_funcionario', { tratamentos, exames, user: req.user });
  } catch (error) {
    res.status(500).send('Erro');
  }
};

const handleVerAgenda = async (req, res) => {
  if (req.user.tipo !== 'tutor') return res.status(403).send('Proibido');
  try {
    const animais = await verAgendaTutor(req.user.id);
    res.render('menu_cliente', { animais, user: req.user }); // Adapte view
  } catch (error) {
    res.status(500).send('Erro');
  }
};

module.exports = { handleAgendarTratamento, handleAgendarExame, handleListarAgendamentos, handleVerAgenda };