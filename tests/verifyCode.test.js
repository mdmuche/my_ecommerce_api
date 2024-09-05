const mongoose = require("mongoose");
const request = require("supertest");

const { server, app } = require("../bin/www");
const { conDb } = require("../utils/connectDb");
const userCollection = require("../models/user");
const tokenCollection = require("../models/token"); // Assuming you have a token model for storing tokens

describe("Testing verifyCode route", () => {
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

  it("should verify the code successfully", async () => {
    // Create a user in the database
    const user = await userCollection.create({
      fullName: "Test User",
      email: "testuser@example.com",
      password: "password123",
    });

    // Create a token in the database
    const token = await tokenCollection.create({
      userId: user._id,
      token: "test-token",
      resetPasswordCode: "123456",
      authPurpose: "send-code-to-email",
    });

    // Make the verify code request
    const response = await request(app)
      .post("/v1/auth/confirm-reset-password-code")
      .send({
        token: "test-token",
        code: "123456",
      })
      .expect(200);

    expect(response.body.message).toBe("code verified");
    expect(response.body.token).toBe("test-token");
  }, 20000);

  it("should return 400 for missing token or code", async () => {
    const response = await request(app)
      .post("/v1/auth/confirm-reset-password-code")
      .send({
        token: "test-token", // Missing code
      })
      .expect(400);

    expect(response.body.message).toBe("fields required");

    const response2 = await request(app)
      .post("/v1/auth/confirm-reset-password-code")
      .send({
        code: "123456", // Missing token
      })
      .expect(400);

    expect(response2.body.message).toBe("fields required");
  }, 20000);

  it("should return 404 for invalid or expired token", async () => {
    const response = await request(app)
      .post("/v1/auth/confirm-reset-password-code")
      .send({
        token: "invalid-token",
        code: "123456",
      })
      .expect(404);

    expect(response.body.message).toBe("invalid or expired token");
  }, 20000);

  it("should return 400 for invalid code", async () => {
    // Create a user in the database
    const user = await userCollection.create({
      fullName: "Test User",
      email: "testuser@example.com",
      password: "password123",
    });

    // Create a token in the database
    const token = await tokenCollection.create({
      userId: user._id,
      token: "test-token",
      resetPasswordCode: "123456",
      authPurpose: "send-code-to-email",
    });

    // Make the verify code request with an invalid code
    const response = await request(app)
      .post("/v1/auth/confirm-reset-password-code")
      .send({
        token: "test-token",
        code: "654321", // Invalid code
      })
      .expect(400);

    expect(response.body.message).toBe("invalid code");
  }, 20000);
});
