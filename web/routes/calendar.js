const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendarController");

router.post("/calendar/exam", calendarController.generateExamCalendar);

router.post(
  "/calendar/study-planner",
  calendarController.generateStudyPlannerCalendar
);

module.exports = router;
