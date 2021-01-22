var express = require("express");
var router = express.Router();
const cors = require("cors");

const { check } = require("express-validator");
const {
	signout,
	signup,
	signin,
	isSignedIn,
	facebook,
	google,
	forgotPassword,
} = require("../controllers/auth");

router.post(
	"/signup",
	[
		check("name", "Name should be atleast 3 char long").isLength({ min: 3 }),
		check("email", "Email is required").isEmail(),
		check("password", "Password should be atleast 5 char long").isLength({
			min: 5,
		}),
	],
	signup
);

router.post("/signup/facebook", facebook);
router.post("/signup/google", google);

router.post(
	"/signin",
	[
		check("email", "Email is required").isEmail(),
		check("password", "Password field is required").isLength({ min: 1 }),
	],
	signin
);

router.get("/signout", signout);
router.post("/send-reset-password-link", cors(), forgotPassword);

module.exports = router;
