const Topic = require("../models/Topic");
const axios = require("axios");

// ===============================
// Show Single Topic
// ===============================
exports.showTopic = async (req, res) => {
  try {

    if (!req.session.user) {
      return res.redirect("/login");
    }

    const topicId = req.params.topicId;

    if (!topicId) {
      return res.status(400).send("Invalid topic ID");
    }

    const topic = await Topic.findOne({
      _id: topicId,
      userId: req.session.user._id
    });

    if (!topic) {
      return res.status(404).send("Topic not found");
    }

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

    if (!topic) {
      return res.status(404).send("Topic not found");
    }

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
// Generate AI Summary
// ===============================
exports.generateSummary = async (req, res) => {
  try {

    const topic = await Topic.findById(req.params.topicId);

    if (!topic) {
      return res.status(404).send("Topic not found");
    }

    const response = await axios.post(
      "http://127.0.0.1:8000/summarize",
      {
        text: topic.content,
        mode: req.body.studyMode
      }
    );

    topic.summary = response.data.summary;
    topic.summaryMode = req.body.studyMode;
    await topic.save();

    res.redirect(`/topics/${req.params.topicId}`);

  } catch (err) {
    console.error("❌ generateSummary error:", err);
    res.status(500).send("Failed to generate summary");
  }
};


// ===============================
// Email Summary
// ===============================
exports.emailSummary = async (req, res) => {
  try {

    const topic = await Topic.findById(req.params.topicId);

    if (!topic) {
      return res.status(404).send("Topic not found");
    }

    // If you already implemented Gmail link method in EJS,
    // this function may not even be needed anymore.
    res.redirect(`/topics/${req.params.topicId}`);

  } catch (err) {
    console.error("❌ emailSummary error:", err);
    res.status(500).send("Failed to send summary");
  }
};
