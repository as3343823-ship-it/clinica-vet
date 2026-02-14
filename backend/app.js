const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require('multer');
const db = require('./config/db');
const { verifyJWT } = require('./middleware/auth');

const {
  handleLoginFuncionario,
  handleLoginTutor,
  handleCadastrarTutor,
  handleAlterarSenha
} = require('./controllers/authController');

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../frontend/public/images/animais')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') return cb(new Error('Apenas JPG/JPEG/PNG'));
    cb(null, true);
  }
});


// Rotas
app.use('/auth', require('./routes/auth'));
app.use('/animais', verifyJWT, require('./routes/animais'));
app.use('/agenda', verifyJWT, require('./routes/agenda'));
app.use('/relatorios', verifyJWT, require('./routes/relatorios'));

app.get('/', (req, res) => res.render('menu_inicial'));

app.get('/menu-funcionario', verifyJWT, (req, res) => {
  if (req.user.tipo !== 'funcionario') return res.status(403).send('Acesso negado');
  res.render('menu_funcionario', { user: req.user });
});

app.get('/menu-cliente', verifyJWT, (req, res) => {
  if (req.user.tipo !== 'tutor') return res.status(403).send('Acesso negado');
  res.render('menu_cliente', { user: req.user });
});

app.listen(3000, () => console.log('Server on 3000'));
module.exports = { 
  upload, 
  
}; 

