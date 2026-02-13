const axios = require("axios");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const { sendEmailWithAttachment } = require("../utils/emailSender");

// ===============================
// Show HelperBot Page
// ===============================
exports.showBot = (req, res) => {
  if (!req.session.chatHistory) {
    req.session.chatHistory = [];
  }

  res.render("helperbot", {
    chatHistory: req.session.chatHistory,
    error: null
  });
};

// ===============================
// Ask Question (Chat Style)
// ===============================
exports.askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.render("helperbot", {
        chatHistory: req.session.chatHistory || [],
        error: "Please enter a question."
      });
    }

    if (!req.session.chatHistory) {
      req.session.chatHistory = [];
    }

    // Add user message
    req.session.chatHistory.push({
      role: "user",
      content: question
    });

    const response = await axios.post(
      "http://127.0.0.1:8000/helperbot",
      { question },
      { timeout: 120000 }
    );

    // Add assistant response
    req.session.chatHistory.push({
      role: "assistant",
      content: response.data.answer
    });

    res.render("helperbot", {
      chatHistory: req.session.chatHistory,
      error: null
    });

  } catch (err) {
    console.error("❌ Chat error:", err.message);

    res.render("helperbot", {
      chatHistory: req.session.chatHistory || [],
      error: "AI service is currently unavailable."
    });
  }
};

// ===============================
// Send Email (Last Q/A Only)
// ===============================
exports.sendEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.render("helperbot", {
        chatHistory: req.session.chatHistory || [],
        error: "Please provide a valid email."
      });
    }

    const chatHistory = req.session.chatHistory || [];

    if (chatHistory.length < 2) {
      return res.render("helperbot", {
        chatHistory,
        error: "No conversation available to send."
      });
    }

    const lastUser = chatHistory[chatHistory.length - 2];
    const lastAssistant = chatHistory[chatHistory.length - 1];

    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, "revizo-helperbot-chat.pdf");

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(18).text("Revizo – HelperBot Chat", { underline: true });
    doc.moveDown();
    doc.fontSize(14).text("Question:");
    doc.fontSize(12).text(lastUser.content);
    doc.moveDown();
    doc.fontSize(14).text("Answer:");
    doc.fontSize(12).text(lastAssistant.content);
    doc.end();

    writeStream.on("finish", async () => {
      await sendEmailWithAttachment({
        to: email,
        subject: "Revizo – HelperBot Chat",
        text: "Attached is your HelperBot conversation.",
        attachmentPath: filePath,
        attachmentName: "revizo-helperbot-chat.pdf"
      });

      res.render("helperbot", {
        chatHistory,
        error: "Email sent successfully ✅"
      });
    });

  } catch (err) {
    console.error("❌ Email error:", err.message);

    res.render("helperbot", {
      chatHistory: req.session.chatHistory || [],
      error: "Failed to send email."
    });
  }
};

// ===============================
// Clear Chat
// ===============================
exports.clearChat = (req, res) => {
  req.session.chatHistory = [];
  res.redirect("/helperbot");
};
