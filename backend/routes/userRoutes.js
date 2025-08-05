const express = require('express');
const router = express.Router();

const { createUser } = require('../controllers/userController');
// Import createEmployee only if implemented and exported
// const { createEmployee } = require('../controllers/userController');

const { requireAuth, requireRole } = require('../middlewares/auth');

// Only superAdmin can create subAdmin
router.post('/createUser', requireAuth, requireRole('superAdmin'), createUser);

// Uncomment and use this route only if createEmployee exists and is exported
// router.post('/employee', requireAuth, requireRole('superAdmin', 'subAdmin'), createEmployee);

module.exports = router;
