const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All user management routes require authentication and either superAdmin or subAdmin role
const managementRoles = ['superAdmin', 'subAdmin'];

router.post('/',authMiddleware, roleMiddleware(managementRoles), userController.createUser);
router.get('/', authMiddleware, roleMiddleware(managementRoles), userController.getallUsers);
router.get('/:id', authMiddleware, roleMiddleware(managementRoles), userController.getUserById);

module.exports = router;
