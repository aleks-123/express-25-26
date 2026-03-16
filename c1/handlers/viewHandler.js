const Movie = require("../pkg/movies/movieSchema");

exports.getLoginForm = (req, res) => {
  try {
    res.status(200).render("login", {
      naslov: "Login forma",
    });
  } catch (err) {
    res.status(500).send("Error");
  }
};

exports.viewallmovies = async (req, res) => {
  try {
    const movies = await Movie.find();

    res.status(200).render("viewFilms", {
      status: "success",
      naslov: "Netflix",
      podnaslov: "Gledaj i strimaj filmovi",
      movies,
    });
  } catch (err) {
    res.status(500).send("Error");
  }
};

exports.oneMovie = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).send("Error");
  }
};

exports.getForgotPasswordForm = async (req, res) => {
  try {
    res.status(200).render("forgotPassword", {
      title: "Forgot password",
    });
  } catch (err) {
    res.status(500).send("Error");
  }
};

exports.submitForgotPassword = async (req, res) => {
  try {
    const user = await user.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).render("forgotPassword", {
        title: "Invalid user",
      });
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
    const resetUrl = `${req.protocol}://${req.get("host")}/resetpasswordview/${token}`;
    const message = `Ja zaboravivte lozinkata. ve molime iskosistete Patch request so vashata nova lozinka i ova e rest url: ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: "Your password reset token (30 min valid)",
      message: message,
    });

    return res.status(200).render("forgotPassword", {
      title: "Invalid user",
    });
  } catch (err) {
    res.status(500).send("Error");
  }
};

exports.getResetPasswordForm = async (req, res) => {
  try {
    res.status(200).render("resetPassword", {
      title: "Resetiracki link",
      token: req.params.token,
    });
  } catch (err) {
    res.status(500).send("Error");
  }
};

exports.submitNewPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token);

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

    res.status(200).render("resetSuccess", {
      title: "Success",
      message: "Your password has beeen reset succesfully",
    });
  } catch (err) {
    res.status(500).send("Error");
  }
};
