const NewsLetter = require("../models/newsLetter");

const createNewsLetter = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: "field required" });
    }

    const newsLetter = await NewsLetter.create({
      email,
    });

    res.status(201).send({ message: "news letter created" });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
};

module.exports = createNewsLetter;
