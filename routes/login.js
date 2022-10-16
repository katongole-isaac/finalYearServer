const express = require("express");
const Joi = require("joi");
const { User } = require("../models/userSchema");
const bcrypt = require("bcrypt");
const { MinistryModel } = require("../models/ministrySchema");
const { AgencyModel } = require("../models/agencySchema");
const { Complaint } = require("../models/complaintSchema");

const router = express.Router();

//All parties use this route for logging in
router.post("/", async (req, res) => {
	let user;
	let complaints;
	let agencyDetails = {
		seen: 0,
		pending: 0,
		forwarded: 0,
		workedUpon: 0,
	};

	const { error } = loginValidate(req.body);
	if (error) return res.status(400).json({ message: error.details[0].message });

	const { password, email, accType } = req.body;

	if (accType === "migrant") {
		user = await User.findOne({ email });
		if (user) complaints = await Complaint.find({ email }).count();
	} else if (accType === "ministry") {
		user = await MinistryModel.findOne({ email });
	} else if (accType === "agency") {
		user = await AgencyModel.findOne({ email });
		if (user) {
			agencyDetails.seen = await Complaint.find({
				agency: user.name,
				status: "seen",
			}).count();
			agencyDetails.pending = await Complaint.find({
				agency: user.name,
				status: "pending",
			}).count();
			agencyDetails.forwarded = await Complaint.find({
				agency: user.name,
				status: "forwarded",
			}).count();
			agencyDetails.workedUpon = await Complaint.find({
				agency: user.name,
				status: "worked-upon",
			}).count();
		}
	}

	if (!user)
		return res.status(400).json({ message: "Invalid email or password" });

	const validPassword = await bcrypt.compare(password, user.password);
	if (!validPassword)
		return res.status(400).json({ message: "Invalid email or password" });

	const maxAge = 7 * 24 * 60 * 60 * 1000; // 'expires in 7days'
	const token = user.genAuthToken();
	res.cookie("x-auth-token", token, { maxAge, httpOnly: true });
	res.setHeader("Set-Cookie", `${token}`);

	if (accType === "migrant") {
		const {
			_id,
			firstname,
			email,
			lastname,
			phone,
			passport,
			profilePic,
			agency,
			accountStatus,
		} = user;
		res.status(200).json({
			message: "logged in",
			user: _id,
			token,
			firstname,
			lastname,
			email,
			phone,
			passport,
			myAgency: agency,
			profilePic,
			status: accountStatus,
			complaints,
		});
	}
	if (accType === "ministry") {
		const { _id, username, email, phone } = user;
		res
			.status(200)
			.json({ message: "logged in", user: _id, token, username, email, phone });
	}

	if (accType === "agency") {
		const { _id, name, email, status, createdAt, phone, location } = user;
		res.status(200).json({
			user: _id,
			name,
			email,
			status,
			createdAt,
			phone,
			token,
			location,
			details: agencyDetails,
		});
	}
});

function loginValidate(user) {
	const schema = Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().max(40).required(),
		accType: Joi.string().required(),
	});

	return schema.validate(user);
}

module.exports = router;
