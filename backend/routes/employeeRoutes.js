const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const employeeController = require('../controllers/employeeController');
const manage_roles = ["superAdmin", "subAdmin"];

router.post('/create', authMiddleware , roleMiddleware(manage_roles), employeeController.createEmployee);

router.get("/code/:code" ,authMiddleware ,roleMiddleware(manage_roles),employeeController.getEmployeebycode)

router.get('/', authMiddleware, roleMiddleware(manage_roles), employeeController.getAllEmployees);

router.get("/email",authMiddleware,roleMiddleware(manage_roles),employeeController.getEmployeeByUserEmail);

router.put("/:code", authMiddleware ,roleMiddleware(manage_roles) , employeeController.updateEmployee)

router.get("/dptid/:dptid" ,authMiddleware, roleMiddleware(manage_roles) , employeeController.getEmployeesByDepartment)

module.exports = router;