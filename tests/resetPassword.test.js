const mongoose = require("mongoose");
const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { server, app } = require("../bin/www");
const { conDb } = require("../utils/connectDb");
const userCollection = require("../models/user");
const tokenCollection = require("../models/token");

describe("Testing resetPassword route", () => {
  beforeAll(async () => {
    await conDb();
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await userCollection.deleteMany({});
    await tokenCollection.deleteMany({});
  });

  it("should reset the password successfully", async () => {
    const saltRounds = 10;

    // Create a user in the database
    const user = await userCollection.create({
      fullName: "Test User",
      email: "testuser@example.com",
      password: bcrypt.hashSync("oldPassword123", saltRounds),
    });

    // Create a token in the database
    const token = await tokenCollection.create({
      userId: user._id,
      token: "test-token",
      authPurpose: "reset-password",
    });

    // Make the reset password request
    const response = await request(app)
      .post("/v1/auth/reset-password")
      .send({
        token: "test-token",
        newPassword: "newPassword123",
      })
      .expect(200);

    expect(response.body.message).toBe("password reset was successful");

    // Verify that the password was updated in the database
    const updatedUser = await userCollection.findById(user._id);
    expect(bcrypt.compareSync("newPassword123", updatedUser.password)).toBe(
      true
    );

    // Verify that the new auth token was generated
    expect(updatedUser.authToken).toBeTruthy();
    const decodedToken = jwt.verify(updatedUser.authToken, process.env.SECRET);
    expect(decodedToken.userId).toBe(user._id.toString());
    expect(decodedToken.email).toBe(user.email);

    // Verify that the token was deleted from the database
    const deletedToken = await tokenCollection.findOne({ token: "test-token" });
    expect(deletedToken).toBeNull();
  }, 20000);

  it("should return 404 for invalid or expired token", async () => {
    const response = await request(app)
      .post("/v1/auth/reset-password")
      .send({
        token: "invalid-token",
        newPassword: "newPassword123",
      })
      .expect(404);

    expect(response.text).toBe("invalid or expired token");
  }, 20000);

  it("should return 404 if user is not found", async () => {
    // Create a token in the database with a non-existent userId
    const token = await tokenCollection.create({
      userId: new mongoose.Types.ObjectId(),
      token: "test-token",
      authPurpose: "reset-password",
    });

    const response = await request(app)
      .post("/v1/auth/reset-password")
      .send({
        token: "test-token",
        newPassword: "newPassword123",
      })
      .expect(404);

    expect(response.body.message).toBe("user not found");
  }, 20000);
});
