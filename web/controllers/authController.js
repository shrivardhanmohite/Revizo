const User = require("../models/User");
const bcrypt = require("bcrypt");

/* ===============================
   RENDER PAGES
================================ */

exports.renderSignup = (req, res) => {
  if (req.query.redirect) {
    req.session.redirectAfterLogin = req.query.redirect;
  }

  res.render("auth/signup", { error: null });
};

exports.renderLogin = (req, res) => {
  if (req.query.redirect) {
    req.session.redirectAfterLogin = req.query.redirect;
  }

  res.render("auth/login", { error: null });
};

/* ===============================
   SIGNUP
================================ */

exports.signup = async (req, res) => {
  try {
    let { name, email, password, department, year } = req.body;

    name = name?.trim();
    email = email?.trim().toLowerCase();

    if (!name || !email || !password) {
      return res.render("auth/signup", { error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.render("auth/signup", { error: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.render("auth/signup", { error: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      department,
      year
    });

    // ✅ Store minimal session data
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // 👑 Admin auto-redirect
    let redirectUrl;
    if (user.role === "admin") {
      redirectUrl = "/admin";
    } else {
      redirectUrl = req.session.redirectAfterLogin || "/index";
    }

    delete req.session.redirectAfterLogin;
    res.redirect(redirectUrl);

  } catch (err) {
    console.error("Signup error:", err);
    res.render("auth/signup", { error: "Signup failed" });
  }
};

/* ===============================
   LOGIN
================================ */

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render("auth/login", { error: "Invalid credentials" });
    }

    // ✅ Store minimal session data
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // 👑 Admin auto-redirect
    let redirectUrl;
    if (user.role === "admin") {
      redirectUrl = "/admin";
    } else {
      redirectUrl = req.session.redirectAfterLogin || "/index";
    }

    delete req.session.redirectAfterLogin;
    res.redirect(redirectUrl);

  } catch (err) {
    console.error("Login error:", err);
    res.render("auth/login", { error: "Login failed" });
  }
};

/* ===============================
   LOGOUT
================================ */

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};