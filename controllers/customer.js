const orderCollection = require("../models/order");
const logUserActivity = require("../utils/activityLogging");

const createOrder = async (req, res, next) => {
  try {
    const userId = req.userDetails.userId;
    const { products } = req.body;

    if (
      products.some(
        (product) =>
          !product.productId || !product.quantity || !product.totalCost
      )
    ) {
      res.status(400).send({
        message: "input field required",
      });
      return;
    }

    const totalAmount = products.reduce((acc, item) => acc + item.totalCost, 0);

    const order = await orderCollection.create({
      customer: userId,
      products,
      totalAmount,
    });

    logUserActivity(userId, "created", order._id, "Order");

    res.status(201).send({ message: "order created" });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderCollection
      .find(
        { customer: req.userDetails.userId },
        "products.productId products.quantity products.totalCost totalAmount"
      )
      .populate(
        "products.productId",
        "prodName prodPrice prodSnippet prodDetails"
      );

    if (orders.length == 0) {
      res.status(404).send({ message: "no orders found" });
      return;
    }

    res.send({ orders });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
};
