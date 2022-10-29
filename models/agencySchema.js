const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const agencySchema = new mongoose.Schema({
	name: {
		type: String,
		minlength: 3,
		maxlength: 255,
		required: true,
		lowercase: true,
	},
	location: {
		type: String,
		minlength: 3,
		maxlength: 255,
		required: true,
		lowercase: true,
	},
	email: { type: String, minlength: 5, maxlength: 255, required: true },
	password: { type: String, maxlength: 1024, required: true },
	phone: { type: String, minlength: 10, maxlength: 20, required: true },
	createdAt: { type: Number, default: Date.now() , immutable: true },
	status: { type: String, default: "Active" },
});

agencySchema.methods.genAuthToken = function () {
	const token = jwt.sign(
		{ id: this._id, isAgency: true },
		config.get("appSecretKey"),
		{ expiresIn: "7d" }
	);

	return token;
};

const AgencyModel = mongoose.model("agency", agencySchema);

module.exports.AgencyModel = AgencyModel;
module.exports.validateAgency = validateAgency;

function validateAgency(agency) {
	const schema = Joi.object({
		name: Joi.string().min(3).max(40).required(),
		email: Joi.string().email().required(),
		password: Joi.string().min(6).max(40).required(),
		phone: Joi.string()
			.regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{4,6}$/i)
			.max(20)
			.required(),
		location: Joi.string().min(3).max(40).required(),
	});
	return schema.validate(agency);
}
