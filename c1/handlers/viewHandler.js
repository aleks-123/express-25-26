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
