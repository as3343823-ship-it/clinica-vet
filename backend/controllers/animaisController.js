const {
  cadastrarAnimal,
  listarAnimaisPorTutor,
  listarTodosAnimais,
  buscarAnimalPorId,
  validarTutorExiste,
  darAltaAnimal,
  listarPontuarios
} = require('../services/animaisService');
const { LISTA_ESPECIES } = require('../especies');

const showCadastroAnimal = (req, res) => {
  if (!['funcionario', 'tutor'].includes(req.user.tipo)) {
    return res.status(403).send('Proibido');
  }

  return res.render('cadastro_animal', {
    especies: LISTA_ESPECIES,
    user: req.user,
    error: null
  });
};

const handleCadastrarAnimal = async (req, res) => {
  try {
    let tutorId = req.user.id;

    if (req.user.tipo === 'funcionario') {
      tutorId = Number(req.body.tutorId);
      if (!tutorId) {
        return res.status(400).render('cadastro_animal', {
          especies: LISTA_ESPECIES,
          user: req.user,
          error: 'Funcionário deve informar o ID do tutor para associar o animal.'
        });
      }
    }

    const tutorExiste = await validarTutorExiste(tutorId);
    if (!tutorExiste) {
      return res.status(400).render('cadastro_animal', {
        especies: LISTA_ESPECIES,
        user: req.user,
        error: 'Tutor não encontrado. Informe um ID de tutor válido.'
      });
    }

    const imagemPath = req.file ? `/images/animais/${req.file.filename}` : null;
    await cadastrarAnimal(req.body, tutorId, imagemPath);

    if (req.user.tipo === 'funcionario') {
      return res.redirect('/animais/lista-completa');
    }

    return res.redirect('/animais/listar-animais');
  } catch (error) {
    return res.status(500).send(error.message || 'Erro ao cadastrar animal');
  }
};

const handleListarAnimais = async (req, res) => {
  if (req.user.tipo !== 'tutor') return res.status(403).send('Proibido');

  try {
    const animais = await listarAnimaisPorTutor(req.user.id);
    return res.render('menu_cliente', { animais, user: req.user });
  } catch (error) {
    return res.status(500).send(error.message || 'Erro ao listar animais');
  }
};

const handleListarTodosAnimais = async (req, res) => {
  if (req.user.tipo !== 'funcionario') return res.status(403).send('Proibido');

  try {
    const animais = await listarTodosAnimais();
    return res.render('menu_funcionario', { user: req.user, animais });
  } catch (error) {
    return res.status(500).send(error.message || 'Erro ao listar animais');
  }
};

const handleVerFichaAnimal = async (req, res) => {
  if (req.user.tipo !== 'funcionario') return res.status(403).send('Proibido');

  try {
    const animal = await buscarAnimalPorId(req.params.id);
    if (!animal) return res.status(404).send('Animal não encontrado');

    return res.render('detalhes_animal', { user: req.user, animal });
  } catch (error) {
    return res.status(500).send(error.message || 'Erro ao carregar ficha do animal');
  }
};

const handleDarAltaAnimal = async (req, res) => {
  if (req.user.tipo !== 'funcionario') return res.status(403).send('Proibido');

  try {
    await darAltaAnimal(Number(req.body.animalId));
    return res.redirect('/animais/lista-completa');
  } catch (error) {
    return res.status(404).send(error.message || 'Animal não encontrado');
  }
};

const handleListarPontuarios = async (req, res) => {
  if (!['funcionario', 'tutor'].includes(req.user.tipo)) return res.status(403).send('Proibido');

  try {
    const pontuarios = await listarPontuarios();
    const dados = req.user.tipo === 'tutor'
      ? pontuarios.filter((p) => p.tutor_id === req.user.id)
      : pontuarios;

    return res.render('prontuarios', { user: req.user, pontuarios: dados });
  } catch (error) {
    return res.status(500).send(error.message || 'Erro ao listar prontuários');
  }
};

module.exports = {
  showCadastroAnimal,
  handleCadastrarAnimal,
  handleListarAnimais,
  handleListarTodosAnimais,
  handleVerFichaAnimal,
  handleDarAltaAnimal,
  handleListarPontuarios
};
