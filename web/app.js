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

// Static folders
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // ✅ NEW

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
// Make user available globally
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
// Routes
// =====================
app.use("/upload", require("./routes/upload"));
app.use("/notes", require("./routes/note"));
app.use("/topics", require("./routes/topic"));
app.use("/helperbot", require("./routes/helperbot"));
app.use("/mock-paper", require("./routes/mockPaper"));
app.use("/study-planner", require("./routes/studyPlanner"));
app.use("/analytics", require("./routes/analytics"));
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/calendar"));

app.get("/features", (req, res) => {
  res.render("features");
});

app.get("/", (req, res) => {
  res.render("dashboard");
});

app.get("/howitworks", (req, res) => {
  res.render("howitworks");
});

app.get("/index", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("index");
});

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
