const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Number,
          required: true,
        },
        totalCost: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
    },
  },
  { timestamps: true }
);

orderSchema.plugin(mongoosePaginate);

const orderCollection = mongoose.model("orders", orderSchema);

module.exports = orderCollection;
