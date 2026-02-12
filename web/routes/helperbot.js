const express = require("express");
const router = express.Router();
const helperbotController = require("../controllers/helperbotController");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/", isLoggedIn, helperbotController.showBot);
router.post("/ask", isLoggedIn, helperbotController.askQuestion);
router.post("/email", isLoggedIn, helperbotController.sendEmail);

module.exports = router;
