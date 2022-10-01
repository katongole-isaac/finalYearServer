const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const _ = require("lodash");
const { User, validateUser } = require("../models/userSchema");
const { AgencyModel } = require("../models/agencySchema");
const { auth } = require("../middleware/auth");

const router = express.Router();

//user signup route
router.post("/", async (req, res) => {
	const { error } = validateUser(req.body);
	if (error) {
		console.log(error);
		return res.status(400).json(error.details[0].message);
	}

	const {
		email: _email,
		password: _password,
		firstname: _firstname,
		lastname: _lastname,
		phone: _phone,
		passport: _passport,
		agency: agencyName,
	} = req.body;

	const user = await User.findOne({ email: _email });
	if (user) return res.status(400).json({ error: "email already exists" });

	const agency = await AgencyModel.findOne({ name: agencyName }).select(
		"_id name"
	);

	const hashedPassword = await hashP(_password);

	const newUser = new User({
		email: _email,
		password: hashedPassword,
		firstname: _firstname,
		lastname: _lastname,
		phone: _phone,
		passport: _passport,
		agency: {
			_id: agency._id,
			name: agency.name,
		},
	});

	await newUser.save();
	const maxAge = 7 * 24 * 60 * 60 * 1000;
	const token = newUser.genAuthToken();

	const {
		email,
		phone,
		firstname,
		profilePic,
		passport,
		lastname,
		_id,
		agency: myAgency,
		accountStatus,
	} = newUser;
	res.cookie("x-auth-token", token, { maxAge, httpOnly: true });
	res.status(201).json({
		user: _id,
		token,
		firstname,
		lastname,
		email,
		phone,
		passport,
		profilePic,
		myAgency,
		status: accountStatus,
	});
});

//Agency registering
router.post("/agency",auth, async (req, res) => {
	const { error } = validateUser(req.body);
	if (error) {
		console.log(error);
		return res.status(400).json(error.details[0].message);
	}

	const {
		email: _email,
		password: _password,
		firstname: _firstname,
		lastname: _lastname,
		phone: _phone,
		passport: _passport,
		agency: agencyName,
	} = req.body;

	const user = await User.findOne({ email: _email });
	if (user) return res.status(400).json({ error: "email already exists" });

	const agency = await AgencyModel.findOne({ name: agencyName }).select(
		"_id name"
	);

	const hashedPassword = await hashP(_password);
	const status = "active";

	const newUser = new User({
		email: _email,
		password: hashedPassword,
		firstname: _firstname,
		lastname: _lastname,
		phone: _phone,
		passport: _passport,
		agency: {
			_id: agency._id,
			name: agency.name,
		},
		accountStatus: status,
	});

	await newUser.save();
	const maxAge = 7 * 24 * 60 * 60 * 1000;
	const token = newUser.genAuthToken();

	const {
		email,
		phone,
		firstname,
		profilePic,
		passport,
		lastname,
		_id,
		agency: myAgency,
		accountStatus,
	} = newUser;

	res.status(201).json({
		user: _id,
		token,
		firstname,
		lastname,
		email,
		phone,
		passport,
		profilePic,
		myAgency,
		status: accountStatus,
	});
});

async function hashP(password) {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(password, salt);
}

module.exports = router;
