exports.getLoginForm = (req, res) => {
  try {
    res.status(200).render("login", {
      naslov: "Login forma",
    });
  } catch (err) {
    res.status(500).send("Error");
  }
};
