const Note = require("../models/Note");
const Topic = require("../models/Topic");
const axios = require("axios");

exports.processPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No PDF received");

    const pdfPath = req.file.path;
    const originalFileName = req.file.originalname;
    const topicTag = req.body.topic || "General";

    const mlResponse = await axios.post(
      "http://127.0.0.1:8000/extract-pdf",
      { pdf_path: pdfPath }
    );

    if (mlResponse.data.error === "NO_TEXT") {
      await Note.create({
        originalFileName,
        storedFilePath: pdfPath,
        fileType: "pdf",
        isTextual: false,
        topicTag
      });

      return res.render("noTextPdf", {
        message: "This PDF contains images/diagrams only.",
        pdfPath,
        originalFileName
      });
    }

    const segmentResponse = await axios.post(
      "http://127.0.0.1:8000/segment-text",
      { cleaned_text: mlResponse.data.cleaned_text }
    );

    const note = await Note.create({
      originalFileName,
      storedFilePath: pdfPath,
      fileType: "pdf",
      isTextual: true
    });

    for (let t of segmentResponse.data.topics || []) {
      await Topic.create({
        userId: req.session.user._id,
        noteId: note._id,
        unit: segmentResponse.data.unit || null,
        title: t.title,
        content: t.content
      });
    }

    res.redirect(`/notes/${note._id}/topics`);
  } catch (err) {
    console.error(err);
    res.status(500).send("PDF processing failed");
  }
};

exports.listTopics = async (req, res) => {
  try {
    const { noteId } = req.params;

    const topics = await Topic.find({
      noteId,
      userId: req.session.user._id
    }).sort({ createdAt: 1 });

    res.render("topicsList", { topics });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load topics");
  }
};
// ===============================
// Store reference-only PDF
// ===============================
exports.storePdfOnly = async (req, res) => {
  try {
    console.log("✅ storePdfOnly hit", req.body);

    const { pdfPath, originalFileName, topic } = req.body;

    await Note.create({
      originalFileName,
      storedFilePath: pdfPath,
      fileType: "pdf",
      isTextual: false,
      topicTag: topic || "General"
    });

    res.redirect("/");

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to store PDF");
  }
};
