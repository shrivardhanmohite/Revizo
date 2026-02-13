const Note = require("../models/Note");
const Topic = require("../models/Topic");
const axios = require("axios");

// ===============================
// Process PDF (Upload + Extract)
// ===============================
exports.processPDF = async (req, res) => {
  try {

    // 🔐 Safety check
    if (!req.session.user) {
      return res.redirect("/login");
    }

    if (!req.file) {
      return res.status(400).send("No PDF received");
    }

    const pdfPath = req.file.path;
    const originalFileName = req.file.originalname;
    const topicTag = req.body.topic || "General";

    // Call ML service to extract text
    const mlResponse = await axios.post(
      "http://127.0.0.1:8000/extract-pdf",
      { pdf_path: pdfPath }
    );

    // ===============================
    // CASE 1: NON-TEXT (Scanned PDF)
    // ===============================
    if (mlResponse.data.error === "NO_TEXT") {

      const note = await Note.create({
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
        pdfPath: pdfPath.split("\\").pop(),
        isReferenceOnly: true
      });

      return res.redirect(`/notes/${note._id}/topics`);
    }

    // ===============================
    // CASE 2: TEXT PDF
    // ===============================
    const segmentResponse = await axios.post(
      "http://127.0.0.1:8000/segment-text",
      { cleaned_text: mlResponse.data.cleaned_text }
    );

    const note = await Note.create({
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
        pdfPath: pdfPath.split("\\").pop(),
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
// List Topics for a Note
// ===============================
exports.listTopics = async (req, res) => {
  try {

    // 🔐 Safety check
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const { noteId } = req.params;

    if (!noteId) {
      return res.status(400).send("Invalid note ID");
    }

    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).send("Note not found");
    }

    const topics = await Topic.find({
      noteId,
      userId: req.session.user._id
    }).sort({ createdAt: 1 });

    res.render("topicsList", {
      note,
      topics
    });

  } catch (err) {
    console.error("❌ List topics error:", err);
    res.status(500).send("Failed to load topics");
  }
};


// ===============================
// Store Reference-Only PDF (Manual)
// ===============================
exports.storePdfOnly = async (req, res) => {
  try {

    // 🔐 Safety check
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const { pdfPath, originalFileName, topic } = req.body;

    if (!pdfPath || !originalFileName) {
      return res.status(400).send("Missing PDF data");
    }

    const note = await Note.create({
      originalFileName,
      storedFilePath: pdfPath,
      fileType: "pdf",
      isTextual: false,
      topicTag: topic || "General"
    });

    await Topic.create({
      userId: req.session.user._id,
      noteId: note._id,
      title: originalFileName,
      content: "",
      pdfPath: pdfPath.split("\\").pop(),
      isReferenceOnly: true
    });

    res.redirect(`/notes/${note._id}/topics`);

  } catch (err) {
    console.error("❌ Store reference error:", err);
    res.status(500).send("Failed to store PDF");
  }
};
