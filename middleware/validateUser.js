const { checkEmailAndFullname } = require("../models/complaintSchema");

const fileFilter = async (req, file, cb) => {
	// const { error } = checkEmailAndFullname(req.body);
	// if (error) cb(new Error("somthing went wrong "), false);
	// else cb(null, true);
	cb(null, true);
};

module.exports.fileFilter = fileFilter;
