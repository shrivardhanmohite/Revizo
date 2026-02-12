const Topic = require("../models/Topic");
const Note = require("../models/Note");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const { sendEmailWithAttachment } = require("../utils/emailSender");

// ===============================
// Show single topic
// ===============================
exports.showTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findOne({
      _id: topicId,
      userId: req.session.user._id
    });

    if (!topic) return res.status(404).send("Topic not found");

    res.render("topic", { topic });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load topic");
  }
};

// ===============================
// Generate AI summary
// ===============================
exports.generateSummary = async (req, res) => {
  try {
    const { topicId } = req.params;
    const studyMode = req.body.studyMode || "exam";

    const topic = await Topic.findOne({
      _id: topicId,
      userId: req.session.user._id
    });

    if (!topic) return res.status(404).send("Topic not found");

    const response = await axios.post("http://127.0.0.1:8000/summarize", {
      text: topic.content,
      mode: studyMode
    });

    topic.summary = response.data.summary;
    topic.summaryMode = studyMode;
    await topic.save();

    res.redirect(`/topics/${topicId}`);
  } catch (err) {
    console.error("Summarization error:", err);
    res.status(500).send("Summarization failed");
  }
};

// ===============================
// Show reference PDFs
// ===============================
exports.showReferences = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findOne({
      _id: topicId,
      userId: req.session.user._id
    });

    if (!topic) return res.status(404).send("Topic not found");

    const references = await Note.find({
      isTextual: false,
      topicTag: topic.title
    }).sort({ createdAt: -1 });

    res.render("referencePages", { topic, references });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load reference pages");
  }
};

// ===============================
// Update importance
// ===============================
exports.updateImportance = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { importance } = req.body;

    const topic = await Topic.findOne({
      _id: topicId,
      userId: req.session.user._id
    });

    if (!topic) return res.status(404).send("Topic not found");

    topic.importance = importance;
    await topic.save();

    res.redirect(`/topics/${topicId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to update importance");
  }
};

// ===============================
// Update teacher comments
// ===============================
exports.updateComments = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { teacherComments } = req.body;

    const topic = await Topic.findOne({
      _id: topicId,
      userId: req.session.user._id
    });

    if (!topic) return res.status(404).send("Topic not found");

    topic.teacherComments = teacherComments;
    await topic.save();

    res.redirect(`/topics/${topicId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to save comments");
  }
};

// ===============================
// Email summary
// ===============================
exports.emailSummary = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { email } = req.body;

    const topic = await Topic.findOne({
      _id: topicId,
      userId: req.session.user._id
    });

    if (!topic || !topic.summary) {
      return res.status(400).send("Summary not available");
    }

    const filePath = path.join(
      __dirname,
      `../temp/${topic.title.replace(/\s+/g, "_")}_summary.pdf`
    );

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(18).text("EduAI – Topic Summary", { underline: true });
    doc.moveDown();
    doc.fontSize(14).text(`Topic: ${topic.title}`);
    doc.moveDown();
    doc.fontSize(12).text(`Study Mode: ${topic.summaryMode || "exam"}`);
    doc.moveDown();
    doc.fontSize(12).text(topic.summary);
    doc.end();

    await sendEmailWithAttachment({
      to: email,
      subject: `EduAI Summary – ${topic.title}`,
      text: "Attached is your AI-generated topic summary for revision.",
      attachmentPath: filePath,
      attachmentName: "topic-summary.pdf"
    });

    res.send("Summary emailed successfully ✅");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to send summary email");
  }
};
