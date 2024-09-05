var express = require("express");

const {
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/admin");
const verifyAuth = require("../middlewares/verifyAuth");
const rolesAllowed = require("../middlewares/roleBasedAuth");
const multerUpload = require("../utils/multer");

var router = express.Router();

router.use(verifyAuth);
router.use(rolesAllowed(["admin"]));

router.post("/", multerUpload.single("prodImg"), createProduct);

router.patch("/:id", multerUpload.single("prodImg"), updateProduct);

router.delete("/:id", deleteProduct);

module.exports = router;
