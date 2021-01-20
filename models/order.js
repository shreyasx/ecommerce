const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const ProductCartSchema = new mongoose.Schema({
	product: {
		type: ObjectId,
		ref: "Product",
	},
	name: String,
	count: Number,
	price: Number,
});

const ProductCart = mongoose.model("ProductCart", ProductCartSchema);

const OrderSchema = new mongoose.Schema(
	{
		products: {
			type: Array,
		},
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		price: Number,
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = { ProductCart, Order };
