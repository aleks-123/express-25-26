const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Movie = require("../pkg/movies/movieSchema");

dotenv.config({ path: path.join(__dirname, "../config.env") });

const sampleMovies = [
  {
    title: "The Dark Knight",
    year: 2008,
    genre: "Action",
    imbdRating: 9.0,
    slika: "dark-knight.jpg",
    sliki: ["dark-knight-1.jpg", "dark-knight-2.jpg"],
  },
  {
    title: "The Hangover",
    year: 2009,
    genre: "Comedy",
    imbdRating: 7.7,
    slika: "hangover.jpg",
    sliki: ["hangover-1.jpg", "hangover-2.jpg"],
  },
  {
    title: "The Shawshank Redemption",
    year: 1994,
    genre: "Drama",
    imbdRating: 9.3,
    slika: "shawshank.jpg",
    sliki: ["shawshank-1.jpg", "shawshank-2.jpg"],
  },
  {
    title: "The Lord of the Rings: The Fellowship of the Ring",
    year: 2001,
    genre: "Fantasy",
    imbdRating: 8.8,
    slika: "lotr-fellowship.jpg",
    sliki: ["lotr-1.jpg", "lotr-2.jpg"],
  },
  {
    title: "Mad Max: Fury Road",
    year: 2015,
    genre: "Action",
    imbdRating: 8.1,
    slika: "mad-max-fury-road.jpg",
    sliki: ["mad-max-1.jpg", "mad-max-2.jpg"],
  },
];

const DB = process.env.DATABASE?.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

const seedMovies = async () => {
  try {
    if (!DB) {
      throw new Error("Missing DATABASE or DATABASE_PASSWORD in config.env");
    }

    await mongoose.connect(DB);
    await Movie.deleteMany({}); // pazete na ova
    const inserted = await Movie.insertMany(sampleMovies);
    console.log(`Inserted ${inserted.length} movies.`);
    await mongoose.connection.close();
  } catch (err) {
    console.log(err.message);
  }
};

seedMovies();
