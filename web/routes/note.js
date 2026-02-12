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
// const noteController = require("../controllers/noteController");

router.get("/:noteId/topics", noteController.listTopics);

// 🔥 THIS is what your form hits
router.post("/upload", upload.single("pdf"), noteController.processPDF);

// Store-only route
router.post("/store-only", noteController.storePdfOnly);

module.exports = router;
