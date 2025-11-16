const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', login);

router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'Authorized access',
    user: req.user, // comes from decoded token
  });
});

module.exports = router;
