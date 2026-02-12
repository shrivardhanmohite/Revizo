const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

// =====================
// Middleware
// =====================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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
// Make user available in all views
// =====================
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// =====================
// MongoDB connection
// =====================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// =====================
// Feature Routes
// =====================

// Upload handler (POST only – UI is in index.ejs)
app.use("/upload", require("./routes/upload"));

// Notes routes (PDF processing + topic saving)
app.use("/notes", require("./routes/note"));

app.get("/features", (req, res) => {
  res.render("features");
});

app.use("/topics", require("./routes/topic"));
app.use("/helperbot", require("./routes/helperbot"));
app.use("/mock-paper", require("./routes/mockPaper"));
app.use("/study-planner", require("./routes/studyPlanner"));
app.use("/analytics", require("./routes/analytics"));
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/calendar"));

// =====================
// ROOT → LANDING (PUBLIC)
// =====================
app.get("/", (req, res) => {
  res.render("dashboard"); // landing page
});

// =====================
// HOW IT WORKS PAGE
// =====================
app.get("/howitworks", (req, res) => {
  res.render("howitworks");
});

// =====================
// MAIN APP → SMART NOTES
// =====================
app.get("/index", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.render("index"); // LLM Smart Notes UI
});

// Optional alias
app.get("/dashboard", (req, res) => {
  res.redirect("/");
});

// =====================
// Server
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Revizo running at http://localhost:${PORT}`);
});
