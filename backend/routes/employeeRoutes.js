const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const employeeController = require('../controllers/employeeController');
const manage_roles = ["superAdmin", "subAdmin"];

router.post('/create', authMiddleware , roleMiddleware(manage_roles), employeeController.createEmployee);

router.get('/', authMiddleware, roleMiddleware(manage_roles), employeeController.getAllEmployees);

module.exports = router;