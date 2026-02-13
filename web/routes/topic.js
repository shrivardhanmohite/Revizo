const express = require("express");
const router = express.Router();
const topicController = require("../controllers/topicController");
const isLoggedIn = require("../middleware/isLoggedIn");

// ===============================
// Show Topic Detail
// ===============================
router.get("/:topicId", isLoggedIn, topicController.showTopic);

// ===============================
// Reference Page
// ===============================
router.get("/:topicId/references", isLoggedIn, topicController.showReferences);

// ===============================
// Update Importance
// ===============================
router.post("/:topicId/importance", isLoggedIn, topicController.updateImportance);

// ===============================
// Update Teacher Comments
// ===============================
router.post("/:topicId/comments", isLoggedIn, topicController.updateComments);

// ===============================
// Generate Summary
// ===============================
router.post("/:topicId/summarize", isLoggedIn, topicController.generateSummary);

// ===============================
// Email Summary
// ===============================
router.post("/:topicId/email-summary", isLoggedIn, topicController.emailSummary);

module.exports = router;
