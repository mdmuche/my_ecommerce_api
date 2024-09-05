const mongoose = require("mongoose");
const request = require("supertest");

const { server, app } = require("../bin/www");
const { conDb } = require("../utils/connectDb");
const NewsLetter = require("../models/newsLetter");

describe("Testing createNewsLetter route", () => {
  beforeAll(async () => {
    await conDb();
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await NewsLetter.deleteMany({});
  });

  it("should create a newsletter subscription", async () => {
    const response = await request(app)
      .post("/v1/newsletter")
      .send({
        email: "newsletter@example.com",
      })
      .expect(201);

    expect(response.body.message).toBe("news letter created");

    const newsletter = await NewsLetter.findOne({
      email: "newsletter@example.com",
    });
    expect(newsletter).toBeTruthy();
  }, 20000);

  it("should return 400 for missing email", async () => {
    const response = await request(app)
      .post("/v1/newsletter")
      .send({})
      .expect(400);

    expect(response.body.message).toBe("field required");
  }, 20000);
});
