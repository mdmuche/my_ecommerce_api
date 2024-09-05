const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { server, app } = require("../bin/www");
const { conDb } = require("../utils/connectDb");
const userCollection = require("../models/user");
const orderCollection = require("../models/order");

jest.mock("../utils/activityLogging");

describe("Order Controller", () => {
  let token;
  let user;

  beforeAll(async () => {
    await conDb();
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear both user and order collections before each test
    await userCollection.deleteMany({});
    await orderCollection.deleteMany({});

    // Create a test user and generate a JWT token for authentication
    const saltRounds = 10;
    user = await userCollection.create({
      fullName: "Test User",
      email: "testuser@example.com",
      password: await bcrypt.hash("password123", saltRounds),
    });

    token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.SECRET,
      { expiresIn: "1h" }
    );
  });

  describe("createOrder", () => {
    it("should create an order successfully", async () => {
      const products = [
        {
          productId: new mongoose.Types.ObjectId(),
          quantity: 2,
          totalCost: 50,
        },
        {
          productId: new mongoose.Types.ObjectId(),
          quantity: 1,
          totalCost: 30,
        },
      ];

      const response = await request(app)
        .post("/v1/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({ products })
        .expect(201);

      expect(response.body.message).toBe("order created");

      const orders = await orderCollection.find({ customer: user._id });
      expect(orders.length).toBe(1);
      expect(orders[0].totalAmount).toBe(80);
    });

    it("should return 400 if products input is invalid", async () => {
      const invalidProducts = [
        { productId: new mongoose.Types.ObjectId(), quantity: 2 }, // Missing totalCost
        { productId: new mongoose.Types.ObjectId(), totalCost: 30 }, // Missing quantity
      ];

      const response = await request(app)
        .post("/v1/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({ products: invalidProducts })
        .expect(400);

      expect(response.body.message).toBe("input field required");
    });

    it("should return 401 if no token is provided", async () => {
      const products = [
        {
          productId: new mongoose.Types.ObjectId(),
          quantity: 2,
          totalCost: 50,
        },
      ];

      const response = await request(app)
        .post("/v1/orders")
        .send({ products })
        .expect(401);

      expect(response.body.message).toBe("no authorization header");
    });
  });

  describe("getAllOrders", () => {
    it("should retrieve all orders for the authenticated user", async () => {
      const products = [
        {
          productId: new mongoose.Types.ObjectId(),
          quantity: 2,
          totalCost: 50,
        },
      ];

      await orderCollection.create({
        customer: user._id,
        products,
        totalAmount: 50,
      });

      const response = await request(app)
        .get("/v1/orders")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.orders.length).toBe(1);
      expect(response.body.orders[0].totalAmount).toBe(50);
    });

    it("should return 404 if no orders are found", async () => {
      const response = await request(app)
        .get("/v1/orders")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe("no orders found");
    });

    it("should return 401 if no token is provided", async () => {
      const response = await request(app).get("/v1/orders").expect(401);

      expect(response.body.message).toBe("no authorization header");
    });
  });
});
