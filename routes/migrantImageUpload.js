const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const{ auth} = require("../middleware/auth");
const { User } = require("../models/userSchema");

const UPLOAD_IMAGE_DIR = "./uploads/images";

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, UPLOAD_IMAGE_DIR);
	},
	filename: function (req, file, cb) {
		const imageName =
			file.originalname + Date.now() + path.extname(file.originalname);
		cb(null, imageName);
	},
});

const fileFilter = function (req, file, cb) {
	//Accepting only images file
	if (file.mimetype === "image/jpeg" || file.mimetype === "image/png")
		cb(null, true);
	else cb(new Error("FIle not Acceted"), false);
};

const upload = multer({ storage: storage, fileFilter }).single("file");

router.put("/", auth, async (req, res) => {
	upload(req, res, async function (err) {
		//error has occured
		console.log(req.file);
		if (err instanceof multer.MulterError)
			return res.status(400).json({ error: err.message });
		else if (err) return res.status(400).json({ error: ` ${err}` });

		//Everything is fine here.
		console.log(req.body);
		const user = await User.findOneAndUpdate(
			{ _id: req.body.id },
			{
				profilePic: req.file.path,
			},
			{
				new: true, //returns the new saved doc
			}
		);

		res.status(200).json({ image_url: user.profilePic });
	});
});

module.exports = router;
