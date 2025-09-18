const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

router.post('/login', login);
// In auth routes/controllers
router.get('/profile', (req, res) => {
  if (req.session && req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

module.exports = router;
