const Note = require("../models/Note");
const Topic = require("../models/Topic");
const axios = require("axios");
const path = require("path");

// 🔥 ML Service Base URL
const ML_BASE_URL = "http://127.0.0.1:8000";


// ===============================
// Process PDF (Upload + Extract)
// ===============================
exports.processPDF = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");
    if (!req.file) return res.status(400).send("No PDF received");

    const pdfPath = req.file.path.replace(/\\/g, "/");
    const originalFileName = req.file.originalname;
    const topicTag = req.body.topic || "General";

    let mlResponse;

    try {
      mlResponse = await axios.post(
        `${ML_BASE_URL}/extract-pdf`,
        { pdf_path: pdfPath },
        { timeout: 5000 }
      );
    } catch (err) {
      console.error("❌ ML Extract Error:", err.code, err.message);
      return res.status(500).send("ML service unavailable (extract)");
    }

    // ===============================
    // CASE 1: NON-TEXT PDF
    // ===============================
    if (mlResponse.data.error === "NO_TEXT") {

      const note = await Note.create({
        userId: req.session.user._id,   // ✅ FIX
        originalFileName,
        storedFilePath: pdfPath,
        fileType: "pdf",
        isTextual: false,
        topicTag
      });

      await Topic.create({
        userId: req.session.user._id,
        noteId: note._id,
        title: originalFileName,
        content: "",
        pdfPath: path.basename(pdfPath),
        isReferenceOnly: true
      });

      return res.redirect(`/notes/${note._id}/topics`);
    }

    // ===============================
    // CASE 2: TEXT PDF
    // ===============================
    let segmentResponse;

    try {
      segmentResponse = await axios.post(
        `${ML_BASE_URL}/segment-text`,
        { cleaned_text: mlResponse.data.cleaned_text },
        { timeout: 5000 }
      );
    } catch (err) {
      console.error("❌ ML Segment Error:", err.code, err.message);
      return res.status(500).send("ML service unavailable (segment)");
    }

    const note = await Note.create({
      userId: req.session.user._id,   // ✅ FIX
      originalFileName,
      storedFilePath: pdfPath,
      fileType: "pdf",
      isTextual: true,
      topicTag
    });

    const topicsData = segmentResponse.data.topics || [];

    for (let t of topicsData) {
      await Topic.create({
        userId: req.session.user._id,
        noteId: note._id,
        unit: segmentResponse.data.unit || null,
        title: t.title,
        content: t.content,
        pdfPath: path.basename(pdfPath),
        isReferenceOnly: false
      });
    }

    return res.redirect(`/notes/${note._id}/topics`);

  } catch (err) {
    console.error("❌ PDF processing error:", err);
    res.status(500).send("PDF processing failed");
  }
};


// ===============================
// List ALL Notes (NEW FEATURE)
// ===============================
// ===============================
// List ALL Notes (TEMP FIX)
// ===============================
exports.listNotes = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const notes = await Note.find({
      userId: req.session.user._id   // 🔥 ONLY current user
    }).sort({ createdAt: -1 });

    res.render("notesList", { notes });

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load notes");
  }
};


// ===============================
// List Topics for a Note
// ===============================
exports.listTopics = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");

    const { noteId } = req.params;

    const note = await Note.findOne({
      _id: noteId,
      userId: req.session.user._id   // ✅ SECURITY FIX
    });

    if (!note) return res.status(404).send("Note not found");

    const topics = await Topic.find({
      noteId,
      userId: req.session.user._id
    }).sort({ createdAt: 1 });

    res.render("topicsList", { note, topics });

  } catch (err) {
    console.error("❌ List topics error:", err);
    res.status(500).send("Failed to load topics");
  }
};


// ===============================
// Store Reference-Only PDF
// ===============================
exports.storePdfOnly = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");

    const { pdfPath, originalFileName, topic } = req.body;

    if (!pdfPath || !originalFileName) {
      return res.status(400).send("Missing PDF data");
    }

    const cleanPath = pdfPath.replace(/\\/g, "/");

    const note = await Note.create({
      userId: req.session.user._id,   // ✅ FIX
      originalFileName,
      storedFilePath: cleanPath,
      fileType: "pdf",
      isTextual: false,
      topicTag: topic || "General"
    });

    await Topic.create({
      userId: req.session.user._id,
      noteId: note._id,
      title: originalFileName,
      content: "",
      pdfPath: path.basename(cleanPath),
      isReferenceOnly: true
    });

    res.redirect(`/notes/${note._id}/topics`);

  } catch (err) {
    console.error("❌ Store reference error:", err);
    res.status(500).send("Failed to store PDF");
  }
};