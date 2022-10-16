const express = require("express");
const { auth } = require("../middleware/auth");
const { validateId } = require("../middleware/validateId");
const validateReqBody = require("../middleware/validateReqBody");
const { upload } = require("../middleware/_multer");
const { Complaint } = require("../models/complaintSchema");
const { User } = require("../models/userSchema");

const router = express.Router();

//getting complaints by searchTerm ===> Used by Agency
router.get("/search", async (req, res) => {
	const complaints = await Complaint.find({ fullname: "" }).sort(
		"fullname"
	);

	res.status(200).json({ res: complaints });
});


//Getting complaints for an agency. used by an agency
router.get("/agency/views", auth, async (req, res) => {
	const complaints = await Complaint.find({ agency: req.query.agency })
		.select("-__v")
		.sort("date");

	res.status(200).json({ res: complaints });
});

//Getting complaints of a specific email addr. Used by a specific user (migrant).
router.get("/views", auth, async (req, res) => {
	const complaints = await Complaint.find({ email: req.query.email })
		.select("-__v")
		.sort("date");

	res.status(200).json({ res: complaints });
});

//Getting a specific complaint by its id. This route is used by agencies to view details for a specific complaint
router.get("/views/:id", auth, async (req, res) => {
	let proPic_url, user;
	const { error } = validateId({ id: req.params.id }); //checking for valid Ids
	if (error)
		return res
			.status(400)
			.json({ error: `Invalid complaint Id provided ${req.params.id}` });

	const complaint = await Complaint.findById(req.params.id)
		.select("-__v")
		.sort("date");

	if (!complaint)
		return res
			.status(404)
			.json({ error: `No complaint with id ${req.params.id}` });

	if (complaint?.userId) {
		user = await User.findById({ _id: complaint.userId });
		proPic_url = user.profilePic;
	} else proPic_url = "";

	res.status(200).json({ res: complaint, profilePic: proPic_url });
});

//Getting all complaints . Viewing all complaints
router.get("/view/all", auth, async (req, res) => {
	const complaints = await Complaint.find({}).select("-__v").sort("date");

	if (complaints.length === 0)
		return res.status(200).json({ msg: "No complaints Found!!" });

	res.status(200).json({ res: complaints });
});

//uploading content of a complaint. Used by migrant to post a complaint
router.post("/", auth, upload.any(), validateReqBody, async (req, res) => {
	let audioUrl = "";
	let videoUrl = "";

	if (req.files.length !== 0) {
		req.files.forEach((file) => {
			file.mimetype === "video/mp4"
				? (videoUrl = file.path)
				: (audioUrl = file.path);
		});
	}

	const user = await User.findById(req.body.id); //if the user checks, he can report his complaint
	if (!user)
		return res.status(400).json({ error: "No Allowed to post a complaint" });

	const desc = req.body?.desc;
	const { fullname, email, reason, agency } = req.body;
	const complaint = new Complaint({
		agency,
		fullname,
		email,
		reason,
		desc,
		audioUrl,
		videoUrl,
		userId: user._id,
	});

	complaint.markModified("date");
	await complaint.save();

	console.log(complaint);
	res.status(200).json(complaint);
});

//Updating the viewed status of the complaint.
//Here the complaint status changes to "seen"
router.put("/updateview", async (req, res) => {
	const { error } = validateId({ id: req.body.id });
	if (error)
		return res
			.status(400)
			.json({ error: `Invalid complaint Id provided ${req.body.id}` });

	const complaint = await Complaint.findByIdAndUpdate(
		{ _id: req.body.id },
		{
			$set: {
				viewed: req.body.viewed,
				status: req.body.status,
			},
		},
		{
			new: true,
		}
	);
	res.status(200).json({ id: complaint._id, viewed: complaint.viewed });
});

//agency adding a comment
router.put("/comment", async (req, res) => {
	const { error } = validateId({ id: req.body.id });
	console.log(req.body.comment);
	if (error)
		return res
			.status(400)
			.json({ error: `Invalid complaint Id provided ${req.body.id}` });

	const complaint = await Complaint.findByIdAndUpdate(
		{ _id: req.body.id },
		{
			$set: {
				comment: req.body.comment,
				commentDate: Date.now(),
			},
		},
		{
			new: true,
		}
	);
	res.status(200).json({ id: complaint._id, comment: complaint.comment });
});

module.exports = router;
