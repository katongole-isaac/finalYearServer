const express = require("express");
const {auth} = require("../middleware/auth");
const { AgencyModel } = require("../models/agencySchema");

const router = express.Router();

//Getting local agency accounts
router.get("/", auth, async (req, res) => {
	const accounts = await AgencyModel.find({})
		.sort({ name: 1, email: 1 })
		.select("-password  -__v");

	if (accounts.length === 0)
		return res.status(200).json({ accounts: "No accounts found" });

	res.status(200).json({ accounts });
});

module.exports = router;
