var express = require("express");

const {
  getAllProducts,
  getProduct,
  getProfile,
  updatePofile,
  deleteProfile,
  getRecentActivities,
  prodLikes,
} = require("../controllers/shared");
const verifyAuth = require("../middlewares/verifyAuth");
const rolesAllowed = require("../middlewares/roleBasedAuth");
const multerUpload = require("../utils/multer");

var router = express.Router();

router.use(verifyAuth);
router.use(rolesAllowed(["customer", "admin"]));

router.get("/:page/:limit", getAllProducts);

router.get("/recent-activities", getRecentActivities);

router.get("/profile", getProfile);

router.get("/:id", getProduct);

router.post("/likes", prodLikes);

router.patch("/profile", multerUpload.single("profileImg"), updatePofile);

router.delete("/profile", deleteProfile);

module.exports = router;
