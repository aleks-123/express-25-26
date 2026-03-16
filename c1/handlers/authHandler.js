//! npm install jsonwebtoken
const jwt = require("jsonwebtoken");
const User = require("../pkg/user/userSchema");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const sendEmail = require("./emailHandler");
const { subscribe } = require("diagnostics_channel");
const crypto = require("crypto");

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
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
      secure: false,
      httpOnly: true,
    });

    await sendEmail({
      email: newUser.email,
      subject: "Vi blagodarime za vashata podrska",
      message: `${newUser.name} dobro dojdovte, se nadevame deka kje si pominite ubavo`,
    });

    res.status(201).json({
      status: "success",
      token,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

exports.login = async (req, res) => {
  try {
    // const email = req.body.email;
    // const password = req.body.password;
    const { email, password } = req.body; //es6

    // 1. Proveruvame dali ima vneseno pasvord ili email
    if (!email || !password) {
      return res.status(400).send("Please provide email and password!");
    }

    // 2. Proveruvame dali korisnkot posti
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send("Invalid email or password");
    }

    // 3. Sporeduvanje na password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid email or password!");
    }

    //4. kje generirame i ispratime token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES,
      },
    );

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
      secure: false,
      httpOnly: true,
    });

    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

exports.protect = async (req, res, next) => {
  try {
    // console.log(req.headers);
    // 1. Go zemame tokenot i proveruvame dali e tamu
    let token;

    if (req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      res.status(401).send("You are not logged in! Please log in");
    }
    console.log(token);

    // 2. Go verificirame tokenot
    // function verifyTokne(token) {
    //   return new Promise((resolve, reject) => {
    //     jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    //       if (err) {
    //         reject(new Error("Token verification failed"));
    //       } else {
    //         resolve(decodedToken);
    //       }
    //     });
    //   });
    // }

    // const verifyAsync = promisify(jwt.verify);
    // const decoded = await verifyAsync(token, process.env.JWT_SECRET);

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decoded);
    // 3. Proveruvame dali postoi
    const userAvt = await User.findById(decoded.id);
    if (!userAvt) {
      return res.status(401).send("User doesnt longer exist!");
    }

    req.user = userAvt;
    next();
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(401).send("You dont have access");
    }
    next();
  };
};

exports.forgotPassword = async (req, res) => {
  try {
    // 1. Go pronaogjame korisnikot so pomosh na neogiviot submitiran email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send("This user doesnt exist");
    }
    // 2. generirame resetiracki token
    const token = crypto.randomBytes(32).toString("hex");

    // 3. generiraniot resetiracki token go hashirame i go vmetnuvame vo data baza kaj korisnikot
    user.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");

    // 4. Generirame vreme na resetirackiot token

    user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
    // 5. novo komponiranite filda gi zacuvuvame vo data baza
    await user.save({ validateBeforeSave: false });

    // 6. Kreirame resetiracki link
    const resetUrl = `${req.protocol}://${req.get("host")}/resetPassword/${token}`;
    const message = `Ja zaboravivte lozinkata. ve molime iskosistete Patch request so vashata nova lozinka i ova e rest url: ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: "Your password reset token (30 min valid)",
      message: message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // 1. Dobieniot token povtorno go hashirame
    const token = req.params.token;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    // 2 Go pronaogjame korisniot od hashiraniot token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).send("token is invalid or expired");
    }

    user.password = req.body.password;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save();

    const jwtToken = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES,
      },
    );

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
      secure: false,
      httpOnly: true,
    });

    res.status(200).json({
      status: "success",
      jwtToken,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// Forma za promena na pw
// => vnesi email
// submit

// pisi ime asdogknadsg
// pisi email ace.@hkasdng
//pisi pw ewgwqggw
// submit

/// forma za logiranje
// pisi email.   test@test.com
// pisi pw       testTest123
// logiranjse     submit
// POST metoda - forma

// -middleare- -> -midelware- -> -submit kon klinetot-

// req, res, next -> req, res, next -> req, res
