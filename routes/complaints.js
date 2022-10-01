const express = require("express");
const { auth } = require("../middleware/auth");
const { validateId } = require("../middleware/validateId");
const validateReqBody = require("../middleware/validateReqBody");
const { upload } = require("../middleware/_multer");
const { Complaint } = require("../models/complaintSchema");
const { User } = require("../models/userSchema");

const router = express.Router();

//Getting complaints of a specific email addr
router.get("/views", auth, async (req, res) => {
	const complaints = await Complaint.find({ email: req.query.email })
		.select("-__v")
		.sort("date");

	res.status(200).json({ res: complaints });
});

//Getting a specific complaint by its id
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

//Getting all complaints
router.get("/view/all", auth, async (req, res) => {
	const complaints = await Complaint.find({}).select("-__v").sort("date");

	if (complaints.length === 0)
		return res.status(200).json({ msg: "No complaints Found!!" });

	res.status(200).json({ res: complaints });
});

//uploading content of a complaint.
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
	const { fullname, email, reason } = req.body;
	const complaint = new Complaint({
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

module.exports = router;
