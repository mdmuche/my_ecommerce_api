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

  it("should login a customer", async () => {
    await request(app)
      .post("/v1/auth/register")
      .send({
        fullName: "admin abula",
        email: "abulamartins@gmail.com",
        password: "Test@123",
      })
      .expect(201);

    const response = await request(app)
      .post("/v1/auth/login")
      .send({
        email: "abulamartins@gmail.com",
        password: "Test@123",
      })
      .expect(200);

    expect(response.body.message).toBe("login successful");
    expect(response.body.userDetails).toBeTruthy();
    expect(response.body.userDetails.fullName).toBeTruthy();
    expect(response.body.userDetails.email).toBeTruthy();
    expect(response.body.userDetails.profileImg).toBeTruthy();
    expect(response.body.userDetails.role).toBeTruthy();
  }, 20000);

  it("should login an admin", async () => {
    await request(app)
      .post("/v1/auth/register")
      .send({
        fullName: "admin abula",
        email: "abulamartins@gmail.com",
        password: "Test@123",
      })
      .expect(201);

    await userCollection.findOneAndUpdate(
      { email: "abulamartins@gmail.com" },
      { isEmailVerified: true, role: "admin" }
    );

    const response = await request(app)
      .post("/v1/auth/login")
      .send({
        email: "abulamartins@gmail.com",
        password: "Test@123",
      })
      .expect(200);

    expect(response.body.message).toBe("login successful");
    expect(response.body.userDetails).toBeTruthy();
    expect(response.body.userDetails.fullName).toBeTruthy();
    expect(response.body.userDetails.email).toBeTruthy();
    expect(response.body.userDetails.profileImg).toBeTruthy();
    expect(response.body.userDetails.role).toBeTruthy();
  }, 20000);
});
