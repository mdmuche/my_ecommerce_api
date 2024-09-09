const mongoose = require("mongoose");
const request = require("supertest");

const { server, app } = require("../bin/www");
const { conDb } = require("../utils/connectDb");
const userCollection = require("../models/user");

describe("Testing all authentication routes", () => {
  beforeAll(async () => {
    await conDb();
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await userCollection.deleteMany({});
  });

  it("should register a customer", async () => {
    const response = await request(app)
      .post("/v1/auth/register")
      .send({
        fullName: "admin abula",
        email: "abulamartins@gmail.com",
        password: "Test@123",
      })
      .expect(201);

    expect(response.body.message).toBe(
      "user created, kindly check your email to verify it"
    );
    expect(response.body.token).toBeTruthy();
  }, 20000);
});
