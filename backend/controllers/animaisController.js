const { cadastrarAnimal, listarAnimaisPorTutor, darAltaAnimal } = require('../services/animaisService');
const { LISTA_ESPECIES } = require('../especies');

const handleCadastrarAnimal = async (req, res) => {
  const tutorId = req.user.tipo === 'tutor' ? req.user.id : req.body.tutorId;
  const imagemPath = req.file ? `/images/animais/${req.file.filename}` : null;
  try {
    await cadastrarAnimal(req.body, tutorId, imagemPath);
    res.redirect(req.user.tipo === 'funcionario' ? '/menu-funcionario' : '/menu-cliente');
  } catch (error) {
    res.status(500).send(error);
  }
};

const handleListarAnimais = async (req, res) => {
  if (req.user.tipo !== 'tutor') return res.status(403).send('Proibido');
  try {
    const animais = await listarAnimaisPorTutor(req.user.id);
    res.render('menu_cliente', { animais, user: req.user });
  } catch (error) {
    res.status(500).send(error);
  }
};

const handleDarAltaAnimal = async (req, res) => {
  try {
    await darAltaAnimal(req.body.nome);
    res.send('Alta OK');
  } catch (error) {
    res.status(404).send(error);
  }
};

const showCadastroAnimal = (_, res) => res.render('cadastro_animal', { especies: LISTA_ESPECIES });

module.exports = { handleCadastrarAnimal, handleListarAnimais, handleDarAltaAnimal, showCadastroAnimal };