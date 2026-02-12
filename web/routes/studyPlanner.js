const express = require("express");
const router = express.Router();
const studyPlannerController = require("../controllers/studyPlannerController");
const isLoggedIn = require("../middleware/isLoggedIn");
router.get("/",isLoggedIn,studyPlannerController.showPlanner);
router.post("/update-stage",isLoggedIn, studyPlannerController.updateStage);

module.exports = router;
