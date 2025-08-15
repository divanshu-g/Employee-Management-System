const express = require("express")
const router = express.Router();
const departmentController = require("../controllers/departmentController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")

const  ManageRole= ["superAdmin", "subAdmin"]

router.post("/",authMiddleware,roleMiddleware(ManageRole), departmentController.createDepartment);
router.get("/", authMiddleware,roleMiddleware(ManageRole), departmentController.getAllDepartments);
router.get("/code/:code",authMiddleware,roleMiddleware(ManageRole),departmentController.getDepartmentByCode);
router.get("/:id", authMiddleware, roleMiddleware(ManageRole), departmentController.getDepartmentById);
router.put("/:id", authMiddleware,roleMiddleware(ManageRole), departmentController.updateDepartment);
router.delete("/:id", authMiddleware,roleMiddleware(ManageRole), departmentController.deleteDepartment);
router.put("/activate/:id", authMiddleware,roleMiddleware(ManageRole), departmentController.activateDepartment);



module.exports = router