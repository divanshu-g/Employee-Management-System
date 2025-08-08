const express = require("express");
const roleController = require("../controllers/roleController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddlware = require("../middlewares/roleMiddleware");
const router = express.Router();

const roleManagers = ['superAdmin', 'subAdmin'];
router.post("/", authMiddleware, roleMiddlware(roleManagers), roleController.createRoles);
router.get('/', authMiddleware, roleMiddlware(roleManagers),roleController.getAllRoles);
router.get('/:id', authMiddleware, roleMiddlware(roleManagers),roleController.getRoleById);
router.put('/:id', authMiddleware, roleMiddlware(roleManagers),roleController.updateRole);
router.delete('/:id', authMiddleware, roleMiddlware(roleManagers),roleController.deleteRole);


module.exports = router;