const express = require("express");

const createNewsLetter = require("../controllers/newsLetter");

let router = express.Router();

router.post("/", createNewsLetter);

module.exports = router;
