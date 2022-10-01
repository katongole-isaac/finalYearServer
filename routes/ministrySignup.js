const express = require("express");
const bcrypt = require("bcrypt");
const { MinistryModel, validateMinistry } = require("../models/ministrySchema");

const router = express.Router();

router.post("/", async (req, res) => {
	const { error } = validateMinistry(req.body);
	if (error) return res.status(400).json(error.details[0].message);

	const { email, password, username, phone } = req.body;

	const user = await MinistryModel.findOne({ email });
	if (user) return res.status(400).json({ error: "email already exists" });

	const hashedPassword = await hashP(password);

	const newUser = new MinistryModel({
		email,
		password: hashedPassword,
		username,
		phone,
	});

	await newUser.save();
	const token = newUser.genAuthToken();

	const maxAge = 7 * 24 * 60 * 60 * 1000;
    
	res.cookie("x-auth-token", token, { maxAge, httpOnly: true });
	res.status(201).json({ token: token });
});

async function hashP(password) {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(password, salt);
}

module.exports = router;
