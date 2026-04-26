const Topic = require("../models/Topic");
const Note = require("../models/Note");
const axios = require("axios");

// ===============================
// Show Page (WITH PDF LIST)
// ===============================
exports.showPage = async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.session.user._id
    });

    res.render("mockPaper", {
      paper: null,
      notes
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load page");
  }
};

// ===============================
// Generate Mock Paper
// ===============================
exports.generatePaper = async (req, res) => {
  try {

    const { noteId } = req.body;

    let topics;

    // 🔥 CASE 1: User selected a PDF
    if (noteId) {
      topics = await Topic.find({
        userId: req.session.user._id,
        noteId
      });
    } 
    // 🔥 CASE 2: Default (IMPORTANT topics)
    else {
      topics = await Topic.find({
        userId: req.session.user._id,
        importance: { $in: ["VV-IMP", "V-IMP"] }
      }).limit(10);
    }

    if (!topics.length) {
      return res.render("mockPaper", {
        paper: "No topics available to generate mock paper.",
        notes: []
      });
    }

    // 🔥 BETTER SYLLABUS (IMPORTANT UPGRADE)
    const syllabusText = topics
      .map(t => `
Topic: ${t.title}

Content:
${t.content || "No content available"}
      `)
      .join("\n\n-------------------\n\n");

    const response = await axios.post(
      "http://127.0.0.1:8000/mock-paper",
      {
        syllabus: syllabusText
      }
    );

    res.render("mockPaper", {
      paper: response.data.paper,
      notes: await Note.find({ userId: req.session.user._id })
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate mock paper");
  }
};