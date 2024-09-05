const jwt = require("jsonwebtoken");

const verifyAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ message: "no authorization header" });
    return;
  }
  const authToken = authHeader.split(" ");
  const authStrategy = authToken[0];
  const tokenItSelf = authToken[1];

  if (tokenItSelf === "") {
    res.status(401).send("no token provided");
    return;
  }

  if (authStrategy.toLocaleLowerCase() != "bearer") {
    res.status(400).send("invalid auth strategy");
    return;
  }

  const userDetails = jwt.verify(tokenItSelf, process.env.SECRET);

  req.userDetails = userDetails;

  console.log("user role is", userDetails.role);

  if (userDetails) {
    next();
  } else {
    res.status(400).send("you are not authorized");
  }
};

module.exports = verifyAuth;
