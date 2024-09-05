const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    activityType: {
      type: String,
      enum: [
        "created",
        "updated",
        "deleted",
        "saved",
        "reviewed",
        "subscribed",
      ],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "itemType",
      required: true,
    },
    itemType: {
      type: String,
      enum: ["Order", "Product", "Token", "User", "NewsLetter"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const UserActivity = mongoose.model("UserActivity", userActivitySchema);

module.exports = UserActivity;
