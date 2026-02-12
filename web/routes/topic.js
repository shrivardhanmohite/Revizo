const express = require("express");
const router = express.Router();
const topicController = require("../controllers/topicController");
const isLoggedIn = require("../middleware/isLoggedIn");
// ===============================
// Topic detail page
// ===============================
router.get("/:topicId", topicController.showTopic);
router.get("/:topicId/references", topicController.showReferences);
router.post("/:topicId/importance", isLoggedIn,topicController.updateImportance);
router.post("/:topicId/comments",isLoggedIn,topicController.updateComments);
router.post("/:id/email-summary",isLoggedIn, topicController.emailSummary);

// ===============================
// Generate AI summary (exam / daily)
// ===============================
router.post("/:topicId/summarize", topicController.generateSummary);

module.exports = router;
