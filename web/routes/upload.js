const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const axios = require("axios");

// =====================
// Multer config
// =====================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "web/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  }
});

// =====================
// Routes
// =====================

// Upload page
router.get("/", (req, res) => {
  res.render("upload");
});

// Upload + forward to notes pipeline
router.post("/", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

 const payload = {
  originalFileName: req.file.originalname,
  pdfPath: req.file.path,
  subjectId: null // or later from dropdown
};

    // 🔁 Forward to notes pipeline
    await axios.post("http://localhost:3000/notes/upload", payload);

    res.redirect("/"); // later: redirect to topics page
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload pipeline failed");
  }
});

module.exports = router;
