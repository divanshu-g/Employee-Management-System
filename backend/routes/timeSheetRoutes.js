const express = require("express")
const router = express.Router()

const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const timeSheetController = require("../controllers/TimeSheetController")

const managementRole = ["superAdmin", "subAdmin", "employee"]

router.post("/entry", authMiddleware, roleMiddleware(managementRole), timeSheetController.TimesheetEntry);
router.post("/leave",authMiddleware,roleMiddleware(managementRole), timeSheetController.leave);
router.get("/getweekly", authMiddleware, roleMiddleware(managementRole), timeSheetController.getWeeklyTimesheet);

module.exports = router