const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "It must have a title"],
    trim: true,
    minlength: [1, "Title is too short"],
    maxlength: [255, "Title is too long"],
    unique: [true, "It must have unique Title"],
  },
  year: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear(),
  },
  genre: {
    type: String,
    enum: ["Action", "Comedy", "Drama", "Fantasy"],
  },
  imbdRating: {
    type: Number,
    min: 0,
    max: 10,
  },
  slika: {
    type: String,
    default: "default.jpg",
  },
  sliki: {
    type: [String],
  },
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
