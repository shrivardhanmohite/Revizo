const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const isLoggedIn = require("../middleware/isLoggedIn");
router.get("/",isLoggedIn, analyticsController.showAnalytics);

module.exports = router;
