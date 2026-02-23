//! npm install jsonwebtoken
const jwt = require("jsonwebtoken");
const User = require("../pkg/user/userSchema");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES,
      },
    );

    res.cookie("jwt", token, {
      exppires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
      secure: false,
      httpOnly: true,
    });

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// pisi ime asdogknadsg
// pisi email ace.@hkasdng
//pisi pw ewgwqggw
// submit
