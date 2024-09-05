const mongoose = require("mongoose");

const newsLetterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  subscribeDate: {
    type: Date,
    default: Date.now,
  },
});

const NewsLetter = mongoose.model("NewsLetter", newsLetterSchema);

module.exports = NewsLetter;
