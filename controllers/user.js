const User = require("../models/user");
const Order = require("../models/order");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Token = require("../models/Token");
const { validationResult } = require("express-validator");
const API = "http://localhost:8000/api";

exports.getStatus = (req, res) => {
	User.findOne({ _id: req.profile._id }, (er, user) => {
		if (er || !user) {
			console.log("aaaaaaaahhhhh");
			return;
		}
		if (!user.encry_password) return res.json("linked");
		res.json("not linked");
	});
};

exports.confirmationPost = (req, res, next) => {
	const errors = validationResult(req);
	const { token } = req.query;
	if (!errors.isEmpty()) {
		return res.status(422).json({
			error: errors.array()[0].msg,
		});
	}
	Token.findOne({ token }, function (err, token) {
		if (!token)
			return res.status(400).send({
				type: "not-verified",
				msg:
					"We were unable to find a valid token. Your token my have expired.",
			});

		// If we found a token, find a matching user
		User.findOne({ _id: token.userId }, function (e, user) {
			if (!user)
				return res
					.status(400)
					.send({ msg: "We were unable to find a user for this token." });
			if (user.verified)
				return res.status(400).send({
					type: "already-verified",
					msg: "This user has already been verified.",
				});

			// Verify and save the user
			user.verified = true;
			console.log(`${user.name} - Verified.`);
			user.save(function (err) {
				if (err) {
					return res.status(500).send({ error: err.message });
				}
				res.status(200).send("The account has been verified. Please log in.");
			});
		});
	});
};

const createToken = userID => {
	const tokenS = new Token({
		userId: userID,
		token: crypto.randomBytes(16).toString("hex"),
	});
	tokenS.save((err, response) => {
		if (err) {
			console.log("unable to save token in db.");
			return;
		}
	});
	return tokenS.token;
};

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "2gi19cs140@students.git.edu",
		pass: "hupfwsmwznwchtsf",
	},
});

const sendMail = (user, res) => {
	var mailOptions = {
		from: "shreyxs@gmail.com",
		to: user.email,
		subject: "Account Verification Token",
		text:
			`Hello ${user.name},\n\n` +
			"Please verify your account by clicking the link: \nhttp://" +
			API +
			"/confirmation?token=" +
			createToken(user.id) +
			"\n",
	};
	transporter.sendMail(mailOptions, function (err, msg) {
		if (err) {
			console.log("send mail error -", err.message);
			res.json({ error: "Couldn't send mail to your address." });
		} else {
			console.log(
				`sent account verification email to ${user.email} sucessfully.`
			);
			res.json("Sent mail");
		}
	});
};

exports.verify = (req, res) => {
	User.findOne({ _id: req.profile._id }, (er, user) => {
		sendMail(user, res);
	});
};

exports.deleteUser = (req, res) => {
	User.deleteOne({ _id: req.profile._id })
		.then(r => res.json("Account deleted successfully!"))
		.catch(console.log);
};

exports.getUserById = (req, res, next, id) => {
	User.findById(id).exec((err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: "No user was found in DB",
			});
		}
		req.profile = user;
		next();
	});
};

exports.getUser = (req, res) => {
	req.profile.salt = undefined;
	req.profile.encry_password = undefined;
	return res.json(req.profile);
};

exports.updateUser = (req, res) => {
	const { password } = req.body;
	if (password.length < 5)
		return res.json({ error: "Password must be 5 or more characters." });
	User.findOne({ _id: req.profile._id }, (err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: "YOU are not AUTHORISED to update this infornmation",
			});
		}
		if (user.authenticate(password))
			return res.status(401).json({
				error: "New password must be different from your existing password.",
			});
		user.password = password;
		user.save().then(() => res.json("donee"));
	});
};

exports.userPurchaseList = (req, res) => {
	Order.find({ user: req.profile._id })
		.populate("user", "_id name")
		.exec((err, order) => {
			if (err) {
				return res.status(400).json({
					error: "NO Order in this account",
				});
			}
			return res.json(order);
		});
};

exports.pushOrderInPurchaseList = (req, res, next) => {
	let purchases = [];
	req.body.order.products.forEach(product => {
		purchases.push({
			_id: product._id,
			name: product.name,
			description: product.description,
			category: product.category,
			quantity: product.quantity,
			amount: req.body.order.amount,
			transaction_id: req.body.order.transaction_id,
		});
	});

	// Store this in DB
	User.findOneAndUpdate(
		{ _id: req.profile._id },
		{ $push: { purchases } },
		{ new: true },
		(err, purchases) => {
			if (err)
				return res.status(400).json({
					error: "Unable to save purchase list",
				});
			res.json(purchases);
			next();
		}
	);
};
