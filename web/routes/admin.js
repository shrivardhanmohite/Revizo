const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");
const isLoggedIn = require("../middleware/isLoggedIn").isLoggedIn;

const Department = require("../models/department");
const User = require("../models/User");

// If these models exist in your project
let Note, Topic;
try {
  Note = require("../models/Note");
} catch (err) {
  Note = null;
}

try {
  Topic = require("../models/Topic");
} catch (err) {
  Topic = null;
}

// 🔐 Protect all admin routes
router.use(isLoggedIn, isAdmin);

/* ===================================================
   ADMIN DASHBOARD
=================================================== */
router.get("/", async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalDepartments = await Department.countDocuments();

  const totalNotes = Note ? await Note.countDocuments() : 0;
  const totalTopics = Topic ? await Topic.countDocuments() : 0;

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5);

  res.render("admin/dashboard", {
    totalUsers,
    totalDepartments,
    totalNotes,
    totalTopics,
    recentUsers
  });
});

/* ===================================================
   DEPARTMENT MANAGEMENT
=================================================== */

router.get("/departments", async (req, res) => {
  const departments = await Department.find();
  res.render("admin/departments", { departments });
});

router.get("/departments/new", (req, res) => {
  res.render("admin/newDepartment");
});

router.post("/departments", async (req, res) => {
  await Department.create(req.body);
  res.redirect("/admin/departments");
});

router.get("/departments/:id/edit", async (req, res) => {
  const department = await Department.findById(req.params.id);
  res.render("admin/editDepartment", { department });
});

router.post("/departments/:id", async (req, res) => {
  await Department.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/admin/departments");
});

router.post("/departments/:id/delete", async (req, res) => {
  await Department.findByIdAndDelete(req.params.id);
  res.redirect("/admin/departments");
});

/* ===================================================
   USER MANAGEMENT (Search + Pagination)
=================================================== */

router.get("/users", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const search = req.query.search || "";

  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      }
    : {};

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.render("admin/users", {
    users,
    currentPage: page,
    totalPages,
    search
  });
});

router.post("/users/:id/promote", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { role: "admin" });
  res.redirect("/admin/users");
});

router.post("/users/:id/demote", async (req, res) => {
  if (req.session.user._id === req.params.id) {
    return res.redirect("/admin/users");
  }
  await User.findByIdAndUpdate(req.params.id, { role: "student" });
  res.redirect("/admin/users");
});

router.post("/users/:id/delete", async (req, res) => {
  if (req.session.user._id === req.params.id) {
    return res.redirect("/admin/users");
  }
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/admin/users");
});

module.exports = router;