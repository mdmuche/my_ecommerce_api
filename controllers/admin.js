const prodCollection = require("../models/product");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");
const logUserActivity = require("../utils/activityLogging");

const createProduct = async (req, res, next) => {
  try {
    const { prodName, prodPrice, prodSnippet, prodDetails } = req.body;
    const userId = req.userDetails.userId;

    if (!prodName || !prodPrice || !prodSnippet || !prodDetails) {
      res.status(400).send({ message: "input field required" });
      return;
    }

    let prodImg = "";
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, "image");

      prodImg = uploadResult.secure_url;

      const product = await prodCollection.create({
        prodName,
        prodPrice,
        prodSnippet,
        prodDetails,
        prodImg: prodImg,
      });

      logUserActivity(userId, "created", product._id, "Product");

      res
        .status(201)
        .send({ message: "product created successfully!", product });
    } else {
      res.status(400).send({ message: "this request doesn't have a file" });
    }
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userDetails.userId;
    const { prodName, prodPrice, prodSnippet, prodDetails } = req.body;

    const product = await prodCollection.findById(id);

    if (!product) {
      return res.status(404).send({ message: "no product to update" });
    }

    let prodImg = product.prodImg;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, "images");

      prodImg = uploadResult.secure_url;
    }

    const updatedProduct = await prodCollection.findByIdAndUpdate(
      id,
      {
        prodName,
        prodPrice,
        prodSnippet,
        prodDetails,
        prodImg: prodImg,
      },
      { new: true }
    );

    logUserActivity(userId, "updated", updatedProduct._id, "Product");

    res.status(200).send({
      message: "product updated successfully!",
      updatedProduct,
    });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
};

const deleteProduct = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.userDetails.userId;

  const product = await prodCollection.findById(id);

  if (!product) {
    res.status(404).send({ message: "product not found" });
    return;
  }

  const toDelete = product.prodImg;

  if (toDelete) {
    await deleteFromCloudinary(toDelete, "image");
  }

  await prodCollection.findByIdAndDelete(id);

  logUserActivity(userId, "deleted", product._id, "Product");

  res.send({ message: "product deleted successfully!" });
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
};
