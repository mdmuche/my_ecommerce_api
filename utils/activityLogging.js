const UserActivity = require("../models/userActivity");

const logUserActivity = async (user, activityType, itemId, itemType) => {
  try {
    await UserActivity.create({
      user,
      activityType,
      itemId,
      itemType,
    });
  } catch (error) {
    console.error("Failed to log user activity:", error);
  }
};

module.exports = logUserActivity;
