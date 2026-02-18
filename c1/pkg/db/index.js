const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: `${__dirname}/../../config.env` });

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

exports.init = async () => {
  try {
    await mongoose.connect(DB);
    console.log("Successfully conneted to DATABASE");
  } catch (err) {
    console.log(err.message);
  }
};
