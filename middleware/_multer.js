const multer = require("multer");
const path = require("path");

//for video files
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./uploads");
	},
	filename: function (req, file, cb) {
		const filenameFormat =
			file.originalname + Date.now() + path.extname(file.originalname);
		cb(null, filenameFormat);
	},
});

const audioStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./uploads/audio");
	},
	filename: function (req, file, cb) {
		const filenameFormat =
			file.originalname + Date.now() + path.extname(file.originalname);
		cb(null, filenameFormat);
	},
});

const upload = multer({ storage });
const audioUpload = multer({ storage: audioStorage });

module.exports.upload = upload;
module.exports.audioUpload = audioUpload;
