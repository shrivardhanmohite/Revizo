const mongoose = require("mongoose");

const aiLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  feature: String,
  inputSize: Number,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AiLog", aiLogSchema);