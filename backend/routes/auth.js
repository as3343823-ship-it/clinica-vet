const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyJWT } = require('../middleware/auth');
const { handleAlterarSenha, handleVerPerfil, handleEditarPerfil } = require('../controllers/authController');

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-seguro-aqui';

const renderInicial = (res, options = {}) => {
  const {
    error = null,
    activeTab = 'login',
    formData = {}
  } = options;

  // "user" Ã© enviado como fallback para evitar ReferenceError caso a view
  // seja editada localmente com referÃªncias a user.* por engano.
  res.render('menu_inicial', { error, activeTab, formData, user: {} });
};

// Tela inicial Ãºnica: login + cadastro
router.get('/', (_, res) => {
  renderInicial(res);
});

// Login Ãºnico (funcionÃ¡rio ou tutor)
router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return renderInicial(res, { error: 'Informe email/username e senha', activeTab: 'login' });
  }

  // Tenta autenticar como funcionÃ¡rio (username)
  db.query('SELECT * FROM usuarios WHERE username = ?', [email], (err, results) => {
    if (err) {
      console.error('Erro no servidor (funcionÃ¡rio):', err);
      return res.status(500).send('Erro no servidor');
    }

    if (results.length > 0) {
      const user = results[0];
      if (bcrypt.compareSync(senha, user.senha_hash)) {
        const token = jwt.sign(
          {
            id: user.id,
            username: user.username,
            nivel: user.nivel,
            tipo: 'funcionario'
          },
          JWT_SECRET,
          { expiresIn: '1h' }
        );

        res.cookie('jwt', token, { httpOnly: true, secure: false, maxAge: 3600000 });
        return res.redirect('/menu-funcionario');
      }
    }

    // Se nÃ£o autenticou como funcionÃ¡rio, tenta como tutor
    db.query('SELECT * FROM tutores WHERE email = ?', [email], (errTutor, tutorResults) => {
      if (errTutor) {
        console.error('Erro no servidor (tutor):', errTutor);
        return res.status(500).send('Erro no servidor');
      }

      if (tutorResults.length > 0) {
        const tutor = tutorResults[0];
        if (bcrypt.compareSync(senha, tutor.senha_hash)) {
          const token = jwt.sign(
            {
              id: tutor.id,
              email: tutor.email,
              nome: tutor.nome,
              tipo: 'tutor'
            },
            JWT_SECRET,
            { expiresIn: '1h' }
          );

          res.cookie('jwt', token, { httpOnly: true, secure: false, maxAge: 3600000 });
          return res.redirect('/menu-cliente');
        }
      }

      return renderInicial(res, { error: 'Credenciais invÃ¡lidas', activeTab: 'login' });
    });
  });
});

// MantÃ©m rota antiga por compatibilidade, mas sempre volta para a tela Ãºnica
router.get('/cadastrar-tutor', (_, res) => {
  res.redirect('/');
});

// Cadastro de tutor com auto-login
router.post('/cadastrar-tutor', (req, res) => {
  const { nome, email, telefone, genero, morada, password } = req.body;

  const formData = {
    nome: nome || '',
    email: email || '',
    telefone: telefone || '',
    genero: genero || '',
    morada: morada || ''
  };

  if (!nome || !email || !password) {
    return renderInicial(res, {
      error: 'Preencha nome, email e senha',
      activeTab: 'cadastro',
      formData
    });
  }

  const senhaHash = bcrypt.hashSync(password, 10);

  db.query(
    'INSERT INTO tutores (nome, email, telefone, genero, morada, senha_hash) VALUES (?, ?, ?, ?, ?, ?)',
    [nome, email, telefone || null, genero || null, morada || null, senhaHash],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return renderInicial(res, {
            error: 'Este email jÃ¡ estÃ¡ cadastrado',
            activeTab: 'cadastro',
            formData
          });
        }

        console.error('Erro ao cadastrar tutor:', err);
        return renderInicial(res, {
          error: 'Erro ao cadastrar tutor',
          activeTab: 'cadastro',
          formData
        });
      }

      const token = jwt.sign(
        {
          id: result.insertId,
          email,
          tipo: 'tutor'
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.cookie('jwt', token, { httpOnly: true, secure: false, maxAge: 3600000 });
      return res.redirect('/menu-cliente');
    }
  );
});

router.get('/logout', (_, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

router.get('/perfil', verifyJWT, handleVerPerfil);

router.get('/alterar-senha', verifyJWT, (req, res) => {
  res.render('alterar_senha', { user: req.user, error: null });
});

router.post('/alterar-senha', verifyJWT, handleAlterarSenha);

router.post('/editar-perfil', verifyJWT, handleEditarPerfil);

module.exports = router;