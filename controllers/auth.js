const User = require("../models/user");
const { body, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");

exports.google = (req, res) => {
	const { name, email, googleId } = req.body;
	User.findOne({ google_id: googleId }, (err, user) => {
		if (err) {
			console.log("err- ", err);
			res.json(err);
			return;
		} else if (!user) {
			User.findOne({ email }, (er, use) => {
				if (er) {
					console.log(er);
					return;
				}
				if (use) {
					res.json({ error: "user email already exists" });
					return;
				}
				const newUser = new User({ name, email, google_id: googleId });
				newUser
					.save()
					.then(() => {
						//create token
						const token = jwt.sign({ _id: newUser._id }, process.env.SECRET);

						//put token in cookie
						res.cookie("token", token, { expire: new Date() + 99 });

						//send response  to frontend
						const { _id, name, email, role } = newUser;
						return res.json({ token, user: { _id, name, email, role } });
					})
					.catch(er => {
						console.log(er);
						res.json({ error: "user email already exists" });
					});
			});
		} else {
			//create token
			const token = jwt.sign({ _id: user._id }, process.env.SECRET);

			//put token in cookie
			res.cookie("token", token, { expire: new Date() + 99 });

			//send response  to frontend
			const { _id, name, email, role } = user;
			return res.json({ token, user: { _id, name, email, role } });
		}
	});
};

exports.facebook = (req, res) => {
	const { name, email, userID } = req.body;
	User.findOne({ fb_id: userID }, (err, user) => {
		if (err) {
			console.log("err- ", err);
			res.json(err);
			return;
		} else if (!user) {
			User.findOne({ email }, (er, use) => {
				if (er) {
					console.log(er);
					return;
				}
				if (use) {
					res.json({ error: "user email already exists" });
					return;
				}
				const newUser = new User({ name, email, fb_id: userID });
				newUser
					.save()
					.then(() => {
						//create token
						const token = jwt.sign({ _id: newUser._id }, process.env.SECRET);

						//put token in cookie
						res.cookie("token", token, { expire: new Date() + 99 });

						//send response  to frontend
						const { _id, name, email, role } = newUser;
						return res.json({ token, user: { _id, name, email, role } });
					})
					.catch(e => {
						console.log(e);
						res.json({ error: "user email already exists" });
					});
			});
		} else {
			//create token
			const token = jwt.sign({ _id: user._id }, process.env.SECRET);

			//put token in cookie
			res.cookie("token", token, { expire: new Date() + 99 });

			//send response  to frontend
			const { _id, name, email, role } = user;
			return res.json({ token, user: { _id, name, email, role } });
		}
	});
};

exports.signup = (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(422).json({
			error: errors.array()[0].msg,
		});
	}

	User.findOne({ email: req.body.email }, (err, u) => {
		if (err) {
			console.log(err);
			return;
		}
		if (u) {
			res.json({ error: "An account with that email already exists." });
			return;
		}
		const newObj = { ...req.body, verified: false };
		const user = new User(newObj);
		user.save((err, user) => {
			if (err) {
				return res.status(400).json({
					err: "NOT able to save user in DB",
				});
			}
			res.json({
				name: user.name,
				email: user.email,
				id: user._id,
			});
		});
	});
};

exports.signin = (req, res) => {
	const errors = validationResult(req);

	const { email, password } = req.body;

	if (!errors.isEmpty()) {
		return res.status(422).json({
			error: errors.array()[0].msg,
		});
	}

	User.findOne({ email }, (err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: "USER email does not exist",
			});
		}

		if (!user.authenticate(password)) {
			return res.status(401).json({
				error: "Email and password do not match",
			});
		}

		//create token
		const token = jwt.sign({ _id: user._id }, process.env.SECRET);

		//put token in cookie
		res.cookie("token", token, { expire: new Date() + 99 });

		//send response  to frontend
		const { _id, name, email, role, verified } = user;
		return res.json({ token, user: { _id, name, email, role, verified } });
	});
};

exports.signout = (req, res) => {
	res.clearCookie("token");
	res.json({
		message: "User signout successfully",
	});
};

//protected routes:)
exports.isSignedIn = expressJwt({
	secret: process.env.SECRET,
	userProperty: "auth",
});

//custom middlewares
exports.isAuthenticated = (req, res, next) => {
	let checker = req.profile && req.auth && req.profile._id == req.auth._id;
	if (!checker) {
		return res.status(403).json({
			error: "ACCESS DENIED",
		});
	}
	next();
};

exports.isAdmin = (req, res, next) => {
	if (req.profile.role === 0) {
		return res.status(403).json({
			error: "You're not an ADMIN!",
		});
	}
	next();
};
