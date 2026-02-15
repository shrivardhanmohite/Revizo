const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendarController");
const isLoggedIn = require("../middleware/isLoggedIn");

// ===============================
// Google OAuth
// ===============================
router.get("/connect", isLoggedIn, calendarController.connectGoogle);
router.get("/google/callback", calendarController.oauthCallback);

// ===============================
// Add Exam Event
// ===============================
router.post("/exam", isLoggedIn, calendarController.generateExamCalendar);

// ===============================
// Add Smart Study Planner
// ===============================
router.post("/study-planner", isLoggedIn, calendarController.generateStudyPlannerCalendar);

module.exports = router;
