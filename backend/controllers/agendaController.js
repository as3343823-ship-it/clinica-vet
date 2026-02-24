const {
  agendarTratamento,
  agendarExame,
  listarAnimaisParaAgendamento,
  listarAgendamentos,
  verAgendaTutor
} = require('../services/agendaService');

const showAgendarTratamento = async (req, res) => {
  if (req.user.tipo !== 'funcionario') return res.status(403).send('Proibido');

  try {
    const animais = await listarAnimaisParaAgendamento();
    return res.render('agendar_tratamento', { user: req.user, animais, error: null });
  } catch (error) {
    return res.status(500).send('Erro ao carregar formulário de agendamento');
  }
};

const handleAgendarTratamento = async (req, res) => {
  if (req.user.tipo !== 'funcionario') return res.status(403).send('Proibido');

  try {
    await agendarTratamento(req.body);
    return res.redirect('/agenda/ver-agenda');
  } catch (error) {
    return res.status(500).send('Erro ao agendar tratamento');
  }
};

const handleAgendarExame = async (req, res) => {
  if (req.user.tipo !== 'funcionario') return res.status(403).send('Proibido');

  try {
    await agendarExame(req.body);
    return res.redirect('/agenda/ver-agenda');
  } catch (error) {
    return res.status(500).send('Erro ao agendar exame');
  }
};

const handleListarAgendamentos = async (req, res) => {
  if (req.user.tipo !== 'funcionario') return res.status(403).send('Proibido');

  try {
    const { tratamentos, exames } = await listarAgendamentos();
    return res.render('agenda', { user: req.user, tratamentos, exames, isTutor: false });
  } catch (error) {
    return res.status(500).send('Erro ao listar agendamentos');
  }
};

const handleVerAgenda = async (req, res) => {
  try {
    if (req.user.tipo === 'funcionario') {
      const { tratamentos, exames } = await listarAgendamentos();
      return res.render('agenda', { user: req.user, tratamentos, exames, isTutor: false });
    }

    if (req.user.tipo === 'tutor') {
      const { tratamentos, exames } = await verAgendaTutor(req.user.id);
      return res.render('agenda', { user: req.user, tratamentos, exames, isTutor: true });
    }

    return res.status(403).send('Proibido');
  } catch (error) {
    return res.status(500).send('Erro ao carregar agenda');
  }
};

module.exports = {
  showAgendarTratamento,
  handleAgendarTratamento,
  handleAgendarExame,
  handleListarAgendamentos,
  handleVerAgenda
};
