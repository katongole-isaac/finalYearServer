const express = require("express");
const { auth } = require("../middleware/auth");
const { Complaint } = require("../models/complaintSchema");
const { AgencyModel } = require("../models/agencySchema");
const { isAdmin } = require("../middleware/isAdmin");
const { User } = require("../models/userSchema");

const router = express.Router();

router.get("/", [auth, isAdmin], async (req, res) => {
	const totalComplaints = await Complaint.find({}).count();
	const totalAgencies = await AgencyModel.find({}).count();
	const migrants = await User.find({}).count();
	const pendingComplaints = await Complaint.find({ status: "pending" }).count();
	const forwardedComplaints = await Complaint.find({
		status: "forwarded",
	}).count();
	const seenComplaints = await Complaint.find({
		status: "seen",
	}).count();

	const workedUponComplaints = await Complaint.find({
		status: "worked-upon",
	}).count();

	res.status(200).json({
		totalComplaints,
		totalAgencies,
		migrants,
		pendingComplaints,
		forwardedComplaints,
		workedUponComplaints,
		seenComplaints,
	});
});

module.exports = router;
