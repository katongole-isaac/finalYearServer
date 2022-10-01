const { validateComplaint } = require("../models/complaintSchema");

module.exports = function (req, res, next) {
	const { error } = validateComplaint(req.body);
	if (error) return res.status(400).json(error.details[0].message);

	next();
};


