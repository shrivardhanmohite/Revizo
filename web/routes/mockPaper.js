const express = require("express");
const router = express.Router();
const mockPaperController = require("../controllers/mockPaperController");
const isLoggedIn = require("../middleware/isLoggedIn");
router.get("/",isLoggedIn, mockPaperController.showPage);
router.post("/generate", isLoggedIn,mockPaperController.generatePaper);

module.exports = router;
