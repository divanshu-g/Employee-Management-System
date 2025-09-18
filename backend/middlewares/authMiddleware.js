// const jwt = require('jsonwebtoken');
// const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user; // Attach session user info to req.user
    next();
  } else {
    return res.status(401).json({ message: 'Unauthorized: Please login.' });
  }
}

module.exports = authMiddleware;


