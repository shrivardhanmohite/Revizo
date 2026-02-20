const express = require("express");
const router = express.Router();
const pyqController = require("../controllers/pyqController");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/", isLoggedIn, pyqController.showDepartments);
router.get("/:id",isLoggedIn, pyqController.openDepartment);

module.exports = router;