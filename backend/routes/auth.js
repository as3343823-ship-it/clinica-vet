const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware JWT (copiado para dentro do arquivo para evitar dependência circular)
const JWT_SECRET = 'seu-secret-super-seguro-aqui';  // Mude isso em produção

const verifyJWT = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.redirect('/');

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.clearCookie('jwt');
    res.redirect('/');
  }
};

// Rota GET - Mostra tela inicial com login/cadastro
router.get('/', (req, res) => {
  res.render('menu_inicial', { error: null });
});

// Rota POST - Login único (funcionário ou tutor)
router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // Tenta como funcionário (username = email)
  db.query('SELECT * FROM usuarios WHERE username = ?', [email], (err, results) => {
    if (err) {
      console.error('Erro no servidor (funcionário):', err);
      return res.status(500).send('Erro no servidor');
    }

    if (results.length > 0) {
      const user = results[0];
      if (bcrypt.compareSync(senha, user.senha_hash)) {
        const token = jwt.sign({
          id: user.id,
          username: user.username,
          nivel: user.nivel,
          tipo: 'funcionario'
        }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('jwt', token, { httpOnly: true, secure: false, maxAge: 3600000 });
        return res.redirect('/menu-funcionario');
      }
    }

    // Tenta como tutor
    db.query('SELECT * FROM tutores WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Erro no servidor (tutor):', err);
        return res.status(500).send('Erro no servidor');
      }

      if (results.length > 0) {
        const tutor = results[0];
        if (bcrypt.compareSync(senha, tutor.senha_hash)) {
          const token = jwt.sign({
            id: tutor.id,
            email: tutor.email,
            tipo: 'tutor'
          }, JWT_SECRET, { expiresIn: '1h' });

          res.cookie('jwt', token, { httpOnly: true, secure: false, maxAge: 3600000 });
          return res.redirect('/menu-cliente');
        }
      }

      // Nenhum encontrado
      res.render('menu_inicial', { error: 'Credenciais inválidas' });
    });
  });
});

// Rota GET - Mostra formulário de cadastro de tutor
router.get('/cadastrar-tutor', (req, res) => {
  res.render('cadastro_tutor', { error: null });
});

// Rota POST - Processa cadastro de tutor
router.post('/cadastrar-tutor', (req, res) => {
  const { nome, email, telefone, genero, morada, password } = req.body;

  if (!nome || !email || !password) {
    return res.render('cadastro_tutor', { error: 'Preencha nome, email e senha' });
  }

  const senhaHash = bcrypt.hashSync(password, 10);

  db.query('INSERT INTO tutores (nome, email, telefone, genero, morada, senha_hash) VALUES (?, ?, ?, ?, ?, ?)',
    [nome, email, telefone || null, genero || null, morada || null, senhaHash],
    (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.render('cadastro_tutor', { error: 'Este email já está cadastrado' });
        }
        console.error('Erro ao cadastrar tutor:', err);
        return res.render('cadastro_tutor', { error: 'Erro ao cadastrar' });
      }

      res.redirect('/');
    }
  );
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

module.exports = router;