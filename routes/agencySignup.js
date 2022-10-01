const express = require("express");
const bcrypt = require("bcrypt");
const { AgencyModel, validateAgency } = require("../models/agencySchema");

const router = express.Router();

router.post("/", async (req, res) => {
	
	const { error } = validateAgency(req.body);
	if (error) return res.status(400).json(error.details[0].message);

	const { email, password, name, phone, location } = req.body;

	const userId = await AgencyModel.find({ name: req.body.name });

	if (userId.length !== 0)
		return res.status(400).json({ error: "user name exists" });

	const user = await AgencyModel.findOne({ email });
	if (user) return res.status(400).json({ error: "email already exists" });

	const hashedPassword = await hashP(password);

	const newUser = new AgencyModel({
		email,
		password: hashedPassword,
		name,
		phone,
		location
	});

	await newUser.save();
	const maxAge = 7 * 24 * 60 * 60 * 1000;
	console.log(newUser);
	const token = newUser.genAuthToken();
	res.cookie("x-auth-token", token, { maxAge, httpOnly: true });
	res.status(201).json({ token: token });
});







async function hashP(password) {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(password, salt);
}

module.exports = router;
