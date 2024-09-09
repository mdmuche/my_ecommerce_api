const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4 } = require("uuid");
const { sendEmail } = require("../utils/emailUtils");
const validator = require("validator");

const userCollection = require("../models/user");
const tokenCollection = require("../models/token");

const saltRounds = 10;

const userRegister = async function (req, res, next) {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).send({ message: "input field required" });
      return;
    }

    if (!validator.isEmail(email)) {
      return res.status(400).send({ message: "Invalid email address" });
    }

    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      return res.status(400).send({
        message:
          "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol.",
      });
    }

    const userEmail = await userCollection.exists({ email });
    if (userEmail) {
      res.status(400).send("user already exists with email");
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const token = v4();

    await userCollection.create({
      fullName,
      email,
      password: hashedPassword,
      authToken: token,
      authPurpose: "verify-email",
    });

    await sendEmail(
      email,
      "verify email",
      "Hello " +
        fullName +
        " the link to verify your email is http://localhost:4000/v1/auth/verify-email/" +
        token
    );

    res.status(201).send({
      message: "user created, kindly check your email to verify it",
      token,
    });
  } catch (err) {
    console.error("server error", err.message);
    res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const doesUserExist = await userCollection.exists({
      authToken: token,
      authPurpose: "verify-email",
    });

    if (!doesUserExist) {
      return res.status(404).send({
        message: "the user does not exist",
      });
    }

    await userCollection.findOneAndUpdate(
      {
        authToken: token,
        authPurpose: "verify-email",
      },
      {
        isEmailVerified: true,
        authToken: "",
        authPurpose: "",
      }
    );

    res.send({
      message: "Email verified successfully!",
    });
  } catch (err) {
    console.error("server error", err.message);
    res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).send("input field required");
      return;
    }

    const userDetails = await userCollection.findOne({ email });

    if (!userDetails) {
      res.status(404).send({
        message: "user not found",
      });
      return;
    }

    const passwordMatch = bcrypt.compareSync(password, userDetails.password);

    if (!passwordMatch) {
      res.status(404).send({
        message: "invalid credentials",
      });
      return;
    }

    const token = jwt.sign(
      {
        userId: userDetails._id,
        fullName: userDetails.fullName,
        email: userDetails.email,
        role: userDetails.role,
      },
      process.env.SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.send({
      message: "login successful",
      userDetails: {
        fullName: userDetails.fullName,
        email: userDetails.email,
        profileImg: userDetails.profileImg,
        role: userDetails.role,
      },
      token,
    });
  } catch (err) {
    console.error("server error", err.message);
    res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: "invalid input" });
    }

    const user = await userCollection.findOne({ email });

    console.log("user is", user);

    if (!user) {
      res.status(404).send({
        message: "user not found",
      });
      return;
    }

    const token = v4();

    let code = String(Math.floor(Math.random() * 10000)).padStart(4, "0");

    await tokenCollection.create({
      userId: user._id,
      token,
      authPurpose: "send-code-to-email",
      resetPasswordCode: code,
    });

    sendEmail(email, "send code to email", "hello your code is " + code);

    res.status(201).send({
      message: "password reset token generated",
      token,
      code,
    });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
};

const verifyCode = async (req, res, next) => {
  try {
    const { token, code } = req.body;

    if (!token || !code) {
      return res.status(400).send({ message: "fields required" });
    }

    const databaseToken = await tokenCollection.findOne({
      token: token,
      authPurpose: "send-code-to-email",
    });

    if (!databaseToken) {
      return res.status(404).send({ message: "invalid or expired token" });
    }

    if (code !== databaseToken.resetPasswordCode) {
      return res.status(400).send({ message: "invalid code" });
    }

    res.send({ message: "code verified", token });
  } catch (err) {
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const resetToken = await tokenCollection.findOne({ token });

    if (!resetToken) {
      res.status(404).send("invalid or expired token");
      return;
    }

    const user = await userCollection.findById(resetToken.userId);

    if (!user) {
      res.status(404).send({
        message: "user not found",
      });
      return;
    }

    const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);

    const newAuthToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.SECRET
    );

    await userCollection.findByIdAndUpdate(resetToken.userId, {
      password: hashedPassword,
      authToken: newAuthToken,
    });

    await tokenCollection.deleteOne({ token });

    res.send({ message: "password reset was successful" });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
};

module.exports = {
  userRegister,
  verifyEmail,
  loginUser,
  forgotPassword,
  verifyCode,
  resetPassword,
};
