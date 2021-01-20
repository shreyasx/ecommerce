const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const OrderSchema = new mongoose.Schema(
	{
		products: { type: Array, required: true },
		user: { type: ObjectId, ref: "User", required: true },
		price: { type: Number, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
