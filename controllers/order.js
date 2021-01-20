const Order = require("../models/order");

exports.saveOrder = (req, res, next) => {
	const { products, price } = req.body;
	console.log(products, price);
	const order = new Order();
	order.products = products;
	order.user = req.profile._id;
	order.price = price;
	order.save().then(() => {
		console.log(order);
		res.json("finee");
	});
	next();
};
