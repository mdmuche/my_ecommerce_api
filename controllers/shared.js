const joi = require("joi");
const mongoose = require("mongoose");

const prodCollection = require("../models/product");
const userCollection = require("../models/user");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");
const UserActivity = require("../models/userActivity");
const logUserActivity = require("../utils/activityLogging");

const getAllProducts = async (req, res, next) => {
  const { page, limit } = req.params;

  const products = await prodCollection
    // .find({}, "-createdAt, -updatedAt")
    .paginate({}, { page, limit });

  if (products.docs == 0) {
    res.status(404).send({ message: "no products found" });
    return;
  }

  res.send({ products });
};

const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(500).send({ message: "internal server error" });
    }

    const product = await prodCollection.findById(id);

    if (!product) {
      return res.status(404).send({ message: "no product found" });
    }

    res.send({ product });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
};

const prodLikes = async (req, res, next) => {
  try {
    const { id, like } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid product ID" });
    }

    const product = await prodCollection.findByIdAndUpdate(
      id,
      { $inc: { prodLikes: like } },
      { new: true } // Return the updated document
    );

    if (!product) {
      return res.status(404).send({ message: "No product found" });
    }

    res.status(202).send({ status: true, product });
  } catch (err) {
    console.error("Server error", err);
    return res
      .status(500)
      .send({ message: "Internal server error", error: err.message });
  }
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req.userDetails.userId;

    const profile = await userCollection
      .findById(userId)
      .select(
        "-password -isEmailVerified -authToken -authPurpose -createdAt -updatedAt"
      );

    if (!profile) {
      return res.status(404).send({ message: "user not found" });
    }

    res.send({ profile });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
};

const updatePofile = async (req, res, next) => {
  try {
    const { email, fullName } = req.body;
    console.log("req body is", req.body);
    const userId = req.userDetails.userId;

    const updateProfileValidationSchema = joi.object({
      email: joi.string().email().optional(),
      fullName: joi.string().optional(),
    });

    const { error: validationError } = updateProfileValidationSchema.validate({
      email,
      fullName,
    });

    if (validationError) {
      return res.send(validationError);
    }

    const profile = await userCollection.findById(userId);

    if (!profile) {
      return res.status(404).send({ message: "not a valid user" });
    }

    let profileImg = profile.profileImg;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, "images");

      profileImg = uploadResult.secure_url;

      const updatedProfile = await userCollection.findByIdAndUpdate(
        userId,
        {
          email,
          fullName,
          profileImg: profileImg,
        },
        { new: true }
      );

      logUserActivity(userId, "updated", updatedProfile._id, "User");

      res.send({ updatedProfile });
    } else {
      const updatedProfile = await userCollection.findByIdAndUpdate(
        userId,
        {
          email,
          fullName,
          profileImg: undefined,
        },
        { new: true }
      );

      logUserActivity(userId, "updated", updatedProfile._id, "User");

      res.send({ updatedProfile });
    }
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.userDetails.userId;

    const userToDelete = await userCollection.findById(userId);

    if (!userToDelete) {
      return res.status(404).send({ message: "not a valid user" });
    }

    await deleteFromCloudinary(userToDelete.profileImg, "images");

    await userCollection.findByIdAndDelete(userId);

    logUserActivity(userId, "deleted", userToDelete, "User");

    res.send({ message: "user deleted successfully!" });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
};

const getRecentActivities = async (req, res, next) => {
  try {
    const userId = req.userDetails.userId;

    const activities = await UserActivity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    if (activities.length === 0) {
      return res.status(404).send({ message: "no activity logged in" });
    }

    res.send({ activities });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  prodLikes,
  getProfile,
  updatePofile,
  deleteProfile,
  getRecentActivities,
};
