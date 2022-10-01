const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const Joi = require("joi");

const ministrySchema = new mongoose.Schema({
	username: {
		type: String,
		minlength: 3,
		maxlength: 255,
		required: true,
		lowercase: true,
	},

	email: { type: String, minlength: 5, maxlength: 255, required: true },
	password: { type: String, maxlength: 1024, required: true },
	phone: { type: String, minlength: 10, maxlength: 20, required: true },
});

ministrySchema.methods.genAuthToken = function () {
	const token = jwt.sign(
		{ id: this._id, isAdmin: true },
		config.get("appSecretKey"),
		{ expiresIn: "7d" }
	);
	return token;
};

const MinistryModel = mongoose.model("ministry", ministrySchema);

module.exports.MinistryModel = MinistryModel;
module.exports.validateMinistry = validateMinistry;

function validateMinistry(ministry) {
	const schema = Joi.object({
		username: Joi.string().min(3).max(40).required(),
		email: Joi.string().email().required(),
		password: Joi.string().min(6).max(40).required(),
		phone: Joi.string()
			.regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/i)
			.max(20)
			.required(),
	});

	return schema.validate(ministry);
}
