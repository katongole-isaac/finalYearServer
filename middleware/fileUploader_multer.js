const Multer = require("multer");
const path = require("path");
const storage = Multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./docs");
	},
	filename: function (req, file, cb) {
		const filenameFormat =
			path.basename(file.originalname, path.extname(file.originalname)) +
			Date.now() +
			path.extname(file.originalname);
		cb(null, filenameFormat);
	},
});

const fileSize = 1024 * 1024 * 5; //5MB
const upload = Multer({
	storage,
	limits: {
		fileSize,
	},
});

module.exports.fileUpload = upload.array("file", 3);
