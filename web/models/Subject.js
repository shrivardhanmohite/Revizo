const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  semester: {
    type: Number
  }

}, { timestamps: true });

module.exports = mongoose.model("Subject", subjectSchema);
