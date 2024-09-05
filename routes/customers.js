var express = require("express");

const { createOrder, getAllOrders } = require("../controllers/customer");
const verifyAuth = require("../middlewares/verifyAuth");
const rolesAllowed = require("../middlewares/roleBasedAuth");

var router = express.Router();

router.use(verifyAuth);
router.use(rolesAllowed(["customer"]));

router.post("/", createOrder);

router.get("/", getAllOrders);

module.exports = router;
