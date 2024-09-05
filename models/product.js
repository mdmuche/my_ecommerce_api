const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const productSchema = new mongoose.Schema(
  {
    prodName: {
      type: String,
      required: true,
    },
    prodPrice: {
      type: Number,
      required: true,
    },
    prodSnippet: {
      type: String,
      required: true,
    },
    prodDetails: {
      type: String,
      required: true,
    },
    prodImg: {
      type: String,
    },
    prodLikes: {
      type: Number,
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

productSchema.plugin(mongoosePaginate);

const prodCollection = mongoose.model("products", productSchema);

module.exports = prodCollection;
