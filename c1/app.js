//! Paketi
// dotenv
// express
// mongoose
// cookie-parser
// multer -> biblioteka sto ni ovozmozuva da dodavame fajlovi vo nashiot backend
// uuid -> biblioteka sto ni ovozmozuva da generirame unikatni indetfikaciski broevi i bukvi
// ❯ npm install multer uuid

const express = require("express");
const cookieParser = require("cookie-parser");
const db = require("./pkg/db/index");
const movies = require("./handlers/movie");
const auth = require("./handlers/authHandler");
const view = require("./handlers/viewHandler");

const app = express();

//* povikuvame middelware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.set("view engine", "ejs");

db.init();

app.post("/api/v1/signup", auth.signup);
app.post("/api/v1/login", auth.login);

//dve ruti

//CRUD
app.get("/movies", auth.protect, movies.getAll);
app.get("/movies/:id", auth.protect, auth.restrict("amdin"), movies.getOne);
app.post("/movies", movies.create);

app.patch("/movies/:id", movies.uploadFilmPhoto, movies.update);
//req.file =
app.delete("/movies/:id", movies.delete);

app.get("/me", auth.protect, movies.getbyUser);
app.post("/createuser", auth.protect, movies.createByUser);

app.get("/login", view.getLoginForm);
app.get("/viewmovies", auth.protect, view.viewallmovies);
// app.get('/viewmovies/:id', view.oneMovie)
//app.get("/mineMovies")

app.listen(process.env.PORT, (err) => {
  if (err) {
    return console.log("Could not start a service");
  }
  console.log(`Service started successfully ${process.env.PORT}`);
});

// cookie(backend). -------> ejs(cookie) ------------->.
// ovde sme se logirale ---> kukito e stasano vo ejs
