const express = require("express");
const roleController = require("../controllers/roleController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddlware = require("../middlewares/roleMiddleware");
const router = express.Router();

const roleManagers = ['superAdmin', 'subAdmin'];
router.post("/", authMiddleware, roleMiddlware(roleManagers), roleController.createRoles);

module.exports = router;