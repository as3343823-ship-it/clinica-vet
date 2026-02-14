const jwt = require('jsonwebtoken');
const JWT_SECRET = 'seu-secret-super-seguro-aqui';

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

module.exports = { verifyJWT };