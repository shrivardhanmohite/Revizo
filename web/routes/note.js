const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const noteController = require("../controllers/noteController");
const isLoggedIn = require("../middleware/isLoggedIn");

// =====================
// Multer config
// =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "web/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDFs allowed"));
    }
  }
});

// =====================
// Routes
// =====================

// 🔐 Protect all note-related routes
router.get("/:noteId/topics", isLoggedIn, noteController.listTopics);

router.post("/upload", isLoggedIn, upload.single("pdf"), noteController.processPDF);

router.post("/store-only", isLoggedIn, noteController.storePdfOnly);

module.exports = router;
