const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { handleCadastrarAnimal, handleListarAnimais, handleDarAltaAnimal, showCadastroAnimal } = require('../controllers/animaisController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../frontend/public/images/animais'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      return cb(new Error('Apenas JPG, JPEG ou PNG são permitidos'));
    }
    cb(null, true);
  }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).send('Imagem muito grande! Máximo 5 MB.');
    }
  } else if (err) {
    return res.status(400).send(err.message);
  }
  next();
});

router.get('/cadastrar-animal', verifyJWT, showCadastroAnimal);
router.post('/cadastrar-animal', verifyJWT, upload.single('imagem'), handleCadastrarAnimal);
router.get('/listar-animais', verifyJWT, handleListarAnimais);
router.post('/buscar-animal', verifyJWT, handleDarAltaAnimal);

module.exports = router;