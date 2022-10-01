const express = require("express");
const Joi = require("joi");
const{ auth} = require("../middleware/auth");
const { AgencyModel } = require("../models/agencySchema");

const router = express.Router();

router.get("/", async (req, res) => {
	const agencies = await AgencyModel.find({}).sort("name").select("name");
	if (agencies.length === 0)
		return res.status(200).json("No Agencies Available");

	res.status(200).json({ agencies });
});

module.exports = router;
