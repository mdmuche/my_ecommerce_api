const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { server, app } = require("../bin/www");
const { conDb } = require("../utils/connectDb");
const userCollection = require("../models/user");
const prodCollection = require("../models/product");
const UserActivity = require("../models/userActivity");

jest.mock("../utils/activityLogging");

describe("Shared Controllers", () => {
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
    // Clear collections before each test
    await userCollection.deleteMany({});
    await prodCollection.deleteMany({});
    await UserActivity.deleteMany({});

    // Create a test user and generate a JWT token for authentication
    const saltRounds = 10;
    user = await userCollection.create({
      fullName: "Test User",
      email: "testuser@example.com",
      password: await bcrypt.hash("password123", saltRounds),
    });

    token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: "customer" },
      process.env.SECRET,
      { expiresIn: "1h" }
    );
  });

  describe("getAllProducts", () => {
    it("should retrieve all products with pagination", async () => {
      await prodCollection.create([
        {
          prodName: "Product 1",
          prodPrice: 10,
          prodSnippet: "product snippet",
          prodDetails: "product details",
          prodImg: 'https://example.com/newthumbnail.jpg"',
        },
        {
          prodName: "Product 2",
          prodPrice: 20,
          prodSnippet: "product snippet",
          prodDetails: "product details",
          prodImg: 'https://example.com/newthumbnail.jpg"',
        },
      ]);

      const response = await request(app)
        .get("/v1/product/1/10")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.products.docs.length).toBe(2);
    });

    it("should return 404 if no products are found", async () => {
      const response = await request(app)
        .get("/v1/product/1/10")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe("no products found");
    });
  });

  describe("getProduct", () => {
    it("should retrieve a product by ID", async () => {
      const product = await prodCollection.create({
        prodName: "Product 2",
        prodPrice: 20,
        prodSnippet: "product snippet",
        prodDetails: "product details",
        prodImg: 'https://example.com/newthumbnail.jpg"',
      });

      const response = await request(app)
        .get(`/v1/product/${product._id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.product.prodName).toBe("Product 2");
      expect(response.body.product.prodPrice).toBe(20);
    });

    it("should return 404 if the product ID is invalid", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/v1/product/${nonExistentId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe("no product found");
    });

    it("should return 500 if the product ID is invalid", async () => {
      const response = await request(app)
        .get("/v1/product/invalidId")
        .set("Authorization", `Bearer ${token}`)
        .expect(500);

      expect(response.body.message).toBe("internal server error");
    });
  });

  describe("prodLikes", () => {
    it("should increment the product likes", async () => {
      // Create a product for the test
      const product = await prodCollection.create({
        prodName: "Product 1",
        prodPrice: 10,
        prodSnippet: "product snippet",
        prodDetails: "product details",
        prodImg: "https://example.com/newthumbnail.jpg",
        prodLikes: 0,
      });

      // Make a request to increment the product likes
      const response = await request(app)
        .post("/v1/product/likes") // Update with the correct route for likes
        .set("Authorization", `Bearer ${token}`)
        .send({ id: product._id, like: 1 }) // Increment likes by 1
        .expect(202);

      expect(response.body.status).toBe(true);
      expect(response.body.product.prodLikes).toBe(1); // Verify the likes were incremented
    });

    it("should return 400 for invalid product ID", async () => {
      const response = await request(app)
        .post("/v1/product/likes") // Update with the correct route for likes
        .set("Authorization", `Bearer ${token}`)
        .send({ id: "invalidId", like: 1 }) // Invalid product ID
        .expect(400);

      expect(response.body.message).toBe("Invalid product ID");
    });

    it("should return 404 if the product is not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post("/v1/product/likes") // Update with the correct route for likes
        .set("Authorization", `Bearer ${token}`)
        .send({ id: nonExistentId, like: 1 }) // Non-existent product ID
        .expect(404);

      expect(response.body.message).toBe("No product found");
    });
  });

  describe("getProfile", () => {
    it("should retrieve the authenticated user's profile", async () => {
      const response = await request(app)
        .get("/v1/product/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.profile.fullName).toBe("Test User");
      expect(response.body.profile.email).toBe("testuser@example.com");
      expect(response.body.profile.password).toBeUndefined();
    });

    it("should return 404 if the user is not found", async () => {
      await userCollection.deleteMany({});

      const response = await request(app)
        .get("/v1/product/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe("user not found");
    });
  });

  describe("getRecentActivities", () => {
    it("should retrieve recent activities for the authenticated user", async () => {
      await UserActivity.create([
        {
          user: user._id,
          activityType: "created",
          itemType: "Product",
          itemId: new mongoose.Types.ObjectId(),
        },
        {
          user: user._id,
          activityType: "updated",
          itemType: "Product",
          itemId: new mongoose.Types.ObjectId(),
        },
      ]);

      const response = await request(app)
        .get("/v1/product/recent-activities")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.activities.length).toBe(2);
    });

    it("should return 404 if no activities are found", async () => {
      const response = await request(app)
        .get("/v1/product/recent-activities")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe("no activity logged in");
    });
  });
});
