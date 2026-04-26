const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    default: null
  },

  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Note",
    required: true
  },

  unit: String,
  title: String,
  content: String,

  importance: {
    type: String,
    enum: ["IMP", "M-IMP", "V-IMP", "VV-IMP"],
    default: "IMP"
  },

  teacherComments: {
    type: String,
    default: ""
  },

  studentNote: {
    type: String,
    default: ""
  },

  summary: {
    type: String,
    default: ""
  },

  summaryMode: {
    type: String,
    enum: ["exam", "daily", "openrouter-vision"],
    default: "exam"
  },

  // 🔥 NEW HISTORY FIELD
  summaryHistory: [
    {
      content: String,
      mode: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  studyStage: {
    type: String,
    enum: ["started", "basics", "practice", "revision", "ready"],
    default: "started"
  },

  pdfPath: {
    type: String,
    default: ""
  },

  isReferenceOnly: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Topic", topicSchema);