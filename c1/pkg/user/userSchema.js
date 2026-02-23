//! npm install validator
//! npm install bcryptjs

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Imeto e zadolzitelno"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, "Ve molam vnesete validen email"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Mora da ima password"],
    // validate: [validator.isStrongPassword, "Mora da e bezbeden passwordot"],
    minLength: [4, "Mora da ima najmalce 4 karakteri"],
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);

  // if (this.isModified("password")) {
  //   this.password = await bcrypt.hash(this.password, 12);
  // }
});

const User = mongoose.model("User", userSchema);
module.exports = User;

// // kriptiranje
// 'tekst123' => '33dd32o3o2tmp' => "tekst123"

// // hashiranje
// 'tekst123' => 'kjasdngaw32jk23' => 'dgsagsdagasdgas'
// "tekst123" => 'kjasdngaw32jk23'

// kjasdngaw32jk23
