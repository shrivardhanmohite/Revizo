const Topic = require("../models/Topic");
const axios = require("axios");
const path = require("path");
const nodemailer = require("nodemailer");

// ===============================
// Show Single Topic
// ===============================
exports.showTopic = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");

    const topic = await Topic.findOne({
      _id: req.params.topicId,
      userId: req.session.user._id
    });

    if (!topic) return res.status(404).send("Topic not found");

    res.render("topic", { topic });

  } catch (err) {
    console.error("❌ showTopic error:", err);
    res.status(500).send("Failed to load topic");
  }
};

// ===============================
// Show References Page
// ===============================
exports.showReferences = async (req, res) => {
  try {
    const topic = await Topic.findOne({
      _id: req.params.topicId,
      userId: req.session.user._id
    });

    if (!topic) return res.status(404).send("Topic not found");

    res.render("referencePages", { topic });

  } catch (err) {
    console.error("❌ showReferences error:", err);
    res.status(500).send("Failed to load references");
  }
};

// ===============================
// Update Importance
// ===============================
exports.updateImportance = async (req, res) => {
  try {
    await Topic.findByIdAndUpdate(req.params.topicId, {
      importance: req.body.importance
    });

    res.redirect(`/topics/${req.params.topicId}`);

  } catch (err) {
    console.error("❌ updateImportance error:", err);
    res.status(500).send("Failed to update importance");
  }
};

// ===============================
// Update Teacher Comments
// ===============================
exports.updateComments = async (req, res) => {
  try {
    await Topic.findByIdAndUpdate(req.params.topicId, {
      teacherComments: req.body.teacherComments
    });

    res.redirect(`/topics/${req.params.topicId}`);

  } catch (err) {
    console.error("❌ updateComments error:", err);
    res.status(500).send("Failed to update comments");
  }
};

// ===============================
// Generate AI Summary (HYBRID + HISTORY FIXED)
// ===============================
exports.generateSummary = async (req, res) => {
  try {
    const topic = await Topic.findOne({
      _id: req.params.topicId,
      userId: req.session.user._id
    });

    if (!topic) return res.status(404).send("Topic not found");

    let summaryResponse;

    // 🔥 CASE 1: TEXT EXISTS → OLLAMA
    if (topic.content && topic.content.trim().length > 50) {

      summaryResponse = await axios.post(
        "http://127.0.0.1:8000/summarize",
        {
          text: topic.content,
          mode: req.body.studyMode || "exam"
        }
      );

      topic.summaryMode = req.body.studyMode || "exam";

    } else {
      // 🔥 CASE 2: IMAGE PDF → OPENROUTER

      const fullPath = path.join(__dirname, "../uploads", topic.pdfPath);

      console.log("📂 Using OpenRouter:", fullPath);

      summaryResponse = await axios.post(
        "http://127.0.0.1:8000/summarize-image-pdf",
        {
          pdf_path: fullPath
        }
      );

      topic.summaryMode = "openrouter-vision";
    }

    console.log("ML RESPONSE:", summaryResponse.data);

    const generatedSummary =
      summaryResponse.data.summary || "No summary generated";

    // ✅ SAVE LATEST
    topic.summary = generatedSummary;

    // ✅ FIX: Ensure history exists
    if (!topic.summaryHistory) {
      topic.summaryHistory = [];
    }

    // ✅ SAVE HISTORY
    topic.summaryHistory.push({
      content: generatedSummary,
      mode: topic.summaryMode,
      createdAt: new Date()
    });

    console.log("📜 History length:", topic.summaryHistory.length);

    await topic.save();

    res.redirect(`/topics/${topic._id}`);

  } catch (err) {
    console.error("❌ generateSummary error:", err);
    res.status(500).send("Failed to generate summary");
  }
};

// ===============================
// EXPORT CSV
// ===============================
exports.exportSummaryCSV = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId);

    if (!topic) return res.status(404).send("Topic not found");

    if (!topic.summaryHistory || topic.summaryHistory.length === 0) {
      return res.send("No history available");
    }

    let csv = "Mode,Date,Summary\n";

    topic.summaryHistory.forEach(item => {
      csv += `"${item.mode}","${item.createdAt}","${item.content.replace(/"/g, '""')}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=summary_${topic._id}.csv`
    );

    res.send(csv);

  } catch (err) {
    console.error("❌ CSV export error:", err);
    res.status(500).send("Export failed");
  }
};

// ===============================
// EMAIL SUMMARY (OPTIONAL BACKEND)
// ===============================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your_email@gmail.com",
    pass: "your_app_password"
  }
});

exports.emailSummary = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId);

    if (!topic) return res.status(404).send("Topic not found");

    const formatted = `
📘 REVIZO SUMMARY

📝 Topic: ${topic.title}

━━━━━━━━━━━━━━━━━━━━

${topic.summary}

━━━━━━━━━━━━━━━━━━━━

Generated using Revizo AI 🚀
`;

    await transporter.sendMail({
      from: "your_email@gmail.com",
      to: req.session.user.email,
      subject: `Revizo Summary - ${topic.title}`,
      text: formatted
    });

    res.redirect(`/topics/${topic._id}`);

  } catch (err) {
    console.error("❌ emailSummary error:", err);
    res.status(500).send("Email failed");
  }
};

// ===============================
// SHOW ALL SUMMARY HISTORY (FIXED)
// ===============================
exports.showHistory = async (req, res) => {
  try {

    const topics = await Topic.find({
      userId: req.session.user._id
    });

    const history = [];

    topics.forEach(topic => {
      if (topic.summaryHistory && topic.summaryHistory.length > 0) {

        topic.summaryHistory.forEach(item => {
          history.push({
            topicTitle: topic.title || "Untitled",
            topicId: topic._id,
            content: item.content,
            mode: item.mode,
            createdAt: item.createdAt
          });
        });

      }
    });

    // 🔥 sort latest first
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log("📜 Total history items:", history.length);

    res.render("history", { history });

  } catch (err) {
    console.error("❌ history error:", err);
    res.status(500).send("Failed to load history");
  }
};