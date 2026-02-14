const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const db = require('./config/db');
const app = express();

const JWT_SECRET = 'seu-secret-super-seguro-aqui';  // Mude para uma chave segura em produção

// Configuração EJS para views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Servir arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Parsers para body e cookies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Configuração Multer para upload de imagens (para animais)
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(__dirname, '../frontend/public/images/animais')),
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(ext.match(/\.(jpg|jpeg|png)$/) ? null : new Error('Só JPG/JPEG/PNG'), true);
  }
});

// Middleware JWT para rotas protegidas
const verifyJWT = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.redirect('/');
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.clearCookie('jwt');
    res.redirect('/');
  }
};

// Rotas
app.use('/auth', require('./routes/auth'));
app.use('/animais', verifyJWT, require('./routes/animais'));
app.use('/agenda', verifyJWT, require('./routes/agenda'));
app.use('/relatorios', verifyJWT, require('./routes/relatorios'));

// Rota inicial (menu inicial)
app.get('/', (_, res) => res.render('menu_inicial'));

// Menu funcionário (protegido)
app.get('/menu-funcionario', verifyJWT, (req, res) => req.user.tipo === 'funcionario' ? res.render('menu_funcionario', { user: req.user }) : res.status(403).send('Proibido'));

// Menu cliente (protegido)
app.get('/menu-cliente', verifyJWT, (req, res) => req.user.tipo === 'tutor' ? res.render('menu_cliente', { user: req.user }) : res.status(403).send('Proibido'));

// Inicia o servidor
app.listen(3000, () => console.log('Server on 3000'));

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const toggle = document.getElementById('mode-toggle');

  // Carrega tema salvo
  if (localStorage.getItem('theme') === 'dark') {
    body.setAttribute('data-bs-theme', 'dark');
    toggle.innerHTML = '<i class="bi bi-sun-fill me-2"></i> Modo Claro';
  }

  toggle.addEventListener('click', () => {
    if (body.getAttribute('data-bs-theme') === 'dark') {
      body.setAttribute('data-bs-theme', 'light');
      localStorage.setItem('theme', 'light');
      toggle.innerHTML = '<i class="bi bi-moon-stars-fill me-2"></i> Modo Escuro';
    } else {
      body.setAttribute('data-bs-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      toggle.innerHTML = '<i class="bi bi-sun-fill me-2"></i> Modo Claro';
    }
  });
});

// Exporta upload e verifyJWT para outros arquivos
module.exports = { upload, verifyJWT };