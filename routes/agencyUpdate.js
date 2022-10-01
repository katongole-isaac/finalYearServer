const express = require("express");
const Joi = require("joi");
const { auth } = require("../middleware/auth");
const { validateId } = require("../middleware/validateId");
const { AgencyModel } = require("../models/agencySchema");

const router = express.Router();

router.get("/");

router.put("/:id", auth, async (req, res) => {
	const { error } = validateId({ id: req.params.id }); //checking for valid Ids
	if (error) return res.status(400).json({ error: "Invalid Id" });

	const { error: bodyError } = validateAgencyUpdate(req.body); //validating the req.body
	if (bodyError)
		return res.status(400).json({ error: bodyError.details[0].message });

	const id = await AgencyModel.findById(req.params.id);
	if (!id) return res.status(404).json({ error: "No agency found" });

	const { name, email, status, location, phone } = req.body;

	const newAgency = await AgencyModel.findOneAndUpdate(
		{ _id: req.params.id },
		{ $set: { name, email, status, location, phone } },
		{
			new: true,
		}
	);

	console.log(newAgency);
	res.status(200).json({ success: true, result: newAgency._id });
});

module.exports = router;

function validateAgencyUpdate(agency) {
	const schema = Joi.object({
		name: Joi.string().min(3).max(40).required(),
		email: Joi.string().email().required(),
		phone: Joi.string()
			.regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{4,6}$/i)
			.max(20)
			.required(),
		location: Joi.string().min(3).max(40).required(),
		createdAt: Joi.date().required(),
		status: Joi.string().required(),
		_id: Joi.objectId().required(),
	});
	return schema.validate(agency);
}
