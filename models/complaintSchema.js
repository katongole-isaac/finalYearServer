const mongoose = require("mongoose");
const Joi = require("joi");

const dateNow = Date.now();
const complaintSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId },
	fullname: { type: String, minlength: 3, maxlength: 255, required: true },
	email: { type: String, minlength: 5, maxlength: 255, required: true },
	reason: { type: String, minlength: 5, maxlength: 255, required: true },
	date: { type: String, default: Date.now },
	desc: { type: String },
	sent: { type: Date, default: Date.now },
	videoUrl: { type: String },
	audioUrl: { type: String },
});

const Complaint = mongoose.model("complaint", complaintSchema);

module.exports.Complaint = Complaint;
module.exports.validateComplaint = validateComplaint;
module.exports.checkEmailAndFullname = checkEmailAndFullname;

function validateComplaint(complaint) {
	const schema = Joi.object({
		fullname: Joi.string().min(3).max(255).required(),
		email: Joi.string().min(5).max(255).required(),
		reason: Joi.string().min(3).max(255).required(),
		desc: Joi.string(),
		id: Joi.objectId().required(),
	});
	return schema.validate(complaint);
}

function checkEmailAndFullname(body) {
	const schema = Joi.object({
		fullname: Joi.string().min(3).max(255).required(),
		email: Joi.string().min(5).max(255).required(),
	});
	return schema.validate(body);
}
