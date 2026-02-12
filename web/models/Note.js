const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null
    },

    originalFileName: {
      type: String,
      required: true
    },

    fileType: {
      type: String,
      enum: ["pdf"],
      default: "pdf"
    },

    storedFilePath: {
      type: String,
      required: true
    },

    extractedTextPath: {
      type: String
    },

    cleanedTextPath: {
      type: String
    },

    // 🧠 NEW: how the student intends to study this note
    studyMode: {
      type: String,
      enum: ["exam", "daily"],
      default: "exam"
    },

    // 📝 Optional description by student
    description: {
      type: String,
      default: ""
    },
    isTextual: {
  type: Boolean,
  default: true
},

topicTag: {
  type: String,
  required: false
}

  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
