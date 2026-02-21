const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  // 👑 NEW ROLE FIELD
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student"
  },

  department: String,

  year: Number,

  google: {
    accessToken: String,
    refreshToken: String,
    calendarConnected: {
      type: Boolean,
      default: false
    }
  }

}, { timestamps: true });


// 🔐 HASH PASSWORD BEFORE SAVE
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});


// 🔑 OPTIONAL: Password Compare Helper (Recommended)
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);