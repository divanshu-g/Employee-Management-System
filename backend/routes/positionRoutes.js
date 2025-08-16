const express = require("express")
const positionController = require("../controllers/positionController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();
const ManageRole = ["superAdmin", "subAdmin"];

router.post("/", authMiddleware, roleMiddleware(ManageRole), positionController.createPosition);
router.get("/", authMiddleware, roleMiddleware(ManageRole), positionController.getAllPositions);
router.get("/:id",authMiddleware, roleMiddleware(ManageRole), positionController.getPositionsById);
router.get("/code/:code",authMiddleware, roleMiddleware(ManageRole), positionController.getPositionByCode);
router.put("/:id",authMiddleware,roleMiddleware(ManageRole),positionController.updatePosition);
router.delete("/:id",authMiddleware, roleMiddleware(ManageRole),positionController.deletePosition);
router.put("/activate/:id",authMiddleware, roleMiddleware(ManageRole),positionController.activatePosition);



module.exports = router