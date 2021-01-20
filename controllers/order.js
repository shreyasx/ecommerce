const Order = require("../models/order");

exports.saveOrder = (req, res, next) => {
	const { products, price, addresses } = req.body;
	const order = new Order();
	order.products = products;
	order.user = req.profile._id;
	order.price = price;
	order.addresses = addresses;
	order.save().then(() => {
		console.log("order saved in db");
		res.json("finee");
	});
};
