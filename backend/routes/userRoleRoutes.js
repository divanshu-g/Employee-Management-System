const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const userRoleController = require("../controllers/userRoleController");

const router = express.Router();

const managementRoles = ['superAdmin', 'subAdmin'];

router.post('/', authMiddleware, roleMiddleware(managementRoles), userRoleController.assignRolesToUser);
router.get('/',authMiddleware,roleMiddleware(managementRoles),userRoleController.getUserRole);
router.get('/:id',authMiddleware,roleMiddleware(managementRoles),userRoleController.getUserRoleById);
router.put('/:id',authMiddleware,roleMiddleware(managementRoles),userRoleController.updateUserRole);

module.exports = router