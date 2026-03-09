const Movie = require("../pkg/movies/movieSchema");

const multer = require("multer");
const uuid = require("uuid");

const imageId = uuid.v4();

const multerStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/img/movies");
  },
  filename: (req, file, callback) => {
    //! movie-unikateId-timestamp.jpg
    const ext = file.mimetype.split("/")[1];
    callback(null, `movie-${imageId}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(new Error("file type not supported"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadFilmPhoto = upload.single("slika"); // req.file;
// exports.uploadFilmPhotos = upload.array("sliki", 3); // req.files
// exports.uploadMultiplePhotos = upload.fields([
//   { name: "slika", maxCount: 1 },
//   { name: "sliki", maxCount: 3 },
// ]);

exports.update = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        movie,
      },
    });
  } catch (err) {
    res.status(501).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const movies = await Movie.find().populate("author");
    res.status(200).json({
      status: "success",
      data: {
        movies,
      },
    });
  } catch (err) {
    res.status(501).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getOne = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        movie,
      },
    });
  } catch (err) {
    res.status(501).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        movie,
      },
    });
  } catch (err) {
    res.status(501).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.delete = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.createByUser = async (req, res) => {
  try {
    // const author = req.user.id;
    const movie = await Movie.create({
      title: req.body.title,
      year: req.body.year,
      author: req.user.id,
    });

    res.status(201).json(movie);
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getbyUser = async (req, res) => {
  try {
    // const author = req.user.id;

    const logiranKorisnikodProtektMidelware = req.user.id;

    const myMovies = await Movie.find({ author: logiranKorisnikodProtektMidelware });

    res.status(200).json(myMovies);
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};
