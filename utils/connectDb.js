const mongoose = require("mongoose");

exports.conDb = async () => {
  try {
    await mongoose.connect(process.env.URL);
    console.log("connection to db was successful!");
  } catch (err) {
    console.log("connection to db wasn't successful!", err.message);
  }
};
