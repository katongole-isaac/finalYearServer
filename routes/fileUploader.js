const express = require("express");
const multer = require("multer");
const { fileUpload } = require("../middleware/fileUploader_multer");
const { auth } = require("../middleware/auth");
const { Complaint } = require("../models/complaintSchema");
const { validateId } = require("../middleware/validateId");

const router = express.Router();

//validate the req before uploading a file.
router.post("/validate", async (req, res) => {
	console.log(req.body, req.user);
	if (!req.body.id)
		return res.status(400).json({ error: "No complaint Id provided" });

	const { error } = validateId(req.body);
	if (error) return res.status(400).json({ error: `Invalid Id ${error} ` });

	res.status(200).json({ continue: true });
});

router.post("/files", auth, (req, res) => {
	fileUpload(req, res, async function (err) {
		console.log(req.files[0], req.body);
		if (err instanceof multer.MulterError)
			return res.status(500).json({ error: err.message });
		else if (err) return res.status(500).json({ error: err.message });

		if (req.files.length === 0)
			return res.status(400).json({ error: "No files provided" });

		//Attaching a file to the complaint
		const complaint = await Complaint.findById(req.body.id);

		if (!complaint)
			//if no complaint with a given id
			return res
				.status(404)
				.json({ error: `No complaint with id: ${req.body.id}` });

		const newComplaint = await Complaint.findByIdAndUpdate(
			//An agency attaching a file to a complaint
			{ _id: req.body.id },
			{
				$set: { attachedFiles: [req.files[0].path] },
			},
			{ new: true }
		);

		res
			.status(200)
			.json({ result: true, msg: "file uploaded", complaint: newComplaint });
	});
});

router.get("/", async (req, res) => {});

router.delete("/upload", (req, res) => {
	console.log(`File deleted`);
	return res.status(200).json({ result: true, msg: "file deleted" });
});

module.exports = router;
