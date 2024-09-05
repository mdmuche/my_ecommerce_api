const mongoose = require("mongoose");
const request = require("supertest");

const { server, app } = require("../bin/www");
const { conDb } = require("../utils/connectDb");
const userCollection = require("../models/user");
const tokenCollection = require("../models/token"); // Assuming you have a token model for storing tokens

describe("Testing forgotPassword route", () => {
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

  it("should generate a password reset token", async () => {
    // Create a user in the database
    const user = await userCollection.create({
      fullName: "Test User",
      email: "testuser@example.com",
      password: "password123",
    });

    // Make the forgot password request
    const response = await request(app)
      .post("/v1/auth/forgot-password")
      .send({
        email: "testuser@example.com",
      })
      .expect(201);

    expect(response.body.message).toBe("password reset token generated");
    expect(response.body.token).toBeTruthy();
    expect(response.body.code).toBeTruthy();

    // Verify that the token was saved in the database
    const savedToken = await tokenCollection.findOne({ userId: user._id });
    expect(savedToken).toBeTruthy();
    expect(savedToken.token).toBe(response.body.token);
  }, 20000);

  it("should return 400 for missing email", async () => {
    const response = await request(app)
      .post("/v1/auth/forgot-password")
      .send({})
      .expect(400);

    expect(response.body.message).toBe("invalid input");
  }, 20000);

  it("should return 404 if user is not found", async () => {
    const response = await request(app)
      .post("/v1/auth/forgot-password")
      .send({
        email: "nonexistentuser@example.com",
      })
      .expect(404);

    expect(response.body.message).toBe("user not found");
  }, 20000);
});
