const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    token: {
      type: String,
      required: true,
    },
    authPurpose: {
      type: String,
    },
    resetPasswordCode: {
      type: String,
    },
  },
  { timestamps: true }
);

const tokenCollection = mongoose.model("tokens", tokenSchema);

module.exports = tokenCollection;
