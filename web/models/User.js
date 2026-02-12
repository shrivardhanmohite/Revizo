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
    unique: true
  },

  password: {
    type: String,
    required: true
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


// 🔐 HASH PASSWORD BEFORE SAVE (MONGOOSE 7+ SAFE)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model("User", userSchema);
