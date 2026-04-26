const axios = require("axios");

const ML_BASE_URL = "http://127.0.0.1:8000";

async function callML(endpoint, payload) {
  try {
    const response = await axios.post(`${ML_BASE_URL}${endpoint}`, payload);
    return response.data;
  } catch (err) {
    console.error("ML Service Error:", err.message);
    throw new Error("AI Service Failed");
  }
}

exports.generateSummary = (text) =>
  callML("/summarize", { text });

exports.generateTags = (text) =>
  callML("/tag", { text });

exports.generateStudyPlan = (data) =>
  callML("/study-plan", data);