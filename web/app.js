const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

// =====================
// Middleware
// =====================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// =====================
// Static folders
// =====================
app.use(express.static(path.join(__dirname, "public")));

// ✅ Uploads (FINAL FIX)
const uploadPath = path.resolve(__dirname, "uploads");
console.log("📂 Uploads served from:", uploadPath);

// Explicit + safe static serving
app.use("/uploads", express.static(uploadPath, {
  index: false,
  redirect: false,
}));

// =====================
// Debug route (REMOVE LATER)
// =====================
app.get("/debug-uploads", (req, res) => {
  try {
    const files = fs.readdirSync(uploadPath);
    res.json({ uploadPath, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// Session
// =====================
const session = require("express-session");
app.use(session({
  secret: "eduai_secret_key",
  resave: false,
  saveUninitialized: false
}));

// =====================
// View Engine
// =====================
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// =====================
// Global Variables
// =====================
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
});

// =====================
// MongoDB
// =====================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// =====================
// Routes
// =====================

// Auth
app.use("/", require("./routes/auth"));

// ✅ Rename to avoid conflict with /uploads
app.use("/file-upload", require("./routes/upload"));

// Notes
app.use("/notes", require("./routes/note"));

// Other modules
app.use("/topics", require("./routes/topic"));
app.use("/helperbot", require("./routes/helperbot"));
app.use("/mock-paper", require("./routes/mockPaper"));
app.use("/study-planner", require("./routes/studyPlanner"));
app.use("/analytics", require("./routes/analytics"));
app.use("/calendar", require("./routes/calendar"));
app.use("/pyqs", require("./routes/pyqs"));
app.use("/admin", require("./routes/admin"));

// =====================
// Static Pages
// =====================
app.get("/features", (req, res) => res.render("features"));
app.get("/", (req, res) => res.render("dashboard"));
app.get("/howitworks", (req, res) => res.render("howitworks"));

app.get("/index", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("index");
});

app.get("/dashboard", (req, res) => res.redirect("/"));

// =====================
// 404 Handler
// =====================
app.use((req, res) => {
  res.status(404).render("errors/404");
});

// =====================
// 500 Handler
// =====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("errors/500");
});

// =====================
// Server
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Revizo running at http://localhost:${PORT}`);
});