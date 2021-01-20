const express = require("express");
const router = express.Router();

const { getUserById } = require("../controllers/user");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { saveOrder } = require("../controllers/order");

router.param("userId", getUserById);
router.post("/newOrder/:userId", isSignedIn, isAuthenticated, saveOrder);

module.exports = router;
