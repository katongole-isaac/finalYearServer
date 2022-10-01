const express = require("express");
const { auth } = require("../middleware/auth");
const { User, validateUser } = require("../models/userSchema");

const Joi = require("joi");
const { validateId } = require("../middleware/validateId");

const router = express.Router();

router.get("/:id", auth, async (req, res) => {
	const { error } = validateId({ id: req.params.id });
	if (error) return res.status(400).json({ error: "Invalid Id !!!" });

	const user = await User.findOne({ _id: req.params.id }).select(
		"-__v  -password "
	);

	if (!user) return res.status(404).json({ message: "User Not Found." });

	res.status(200).json({ user });
});

router.get("/accounts/view", auth, async (req, res) => {
	console.log(req.query);
	const accounts = await User.find({
		"agency.name": req.query.name,
		accountStatus: req.query.status,
	})
		.limit(20)
		.sort({ email: 1 })
		.select("-__v -password");
	res.status(200).json({ accounts });
});

router.put("/accounts/update/:id", auth, async (req, res) => {
	const { error } = validateId({ id: req.params.id }); //checking for valid Ids
	if (error) return res.status(400).json({ error: "Invalid Id" });

	const { error: ex } = validateUserUpdate(req.body);
	if (ex) return res.status(400).json(ex.details[0].message);

	console.log(req.body);
	const { firstname, lastname, email, phone, passport, accountStatus } =
		req.body;
	const newUser = await User.findOneAndUpdate(
		{ _id: req.params.id },
		{
			$set: { firstname, lastname, email, phone, passport, accountStatus },
		},
		{
			new: true,
		}
	);

	res.status(200).json({ success: true, result: newUser._id });
});

module.exports = router;


function validateUserUpdate(user) {
	const schema = Joi.object({
		_id: Joi.objectId().required(),
		firstname: Joi.string().min(3).max(40).required(),
		lastname: Joi.string().min(3).max(40).required(),
		email: Joi.string().email().required(),
		passport: Joi.string().min(9).max(20).required(),
		phone: Joi.string()
			.regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/i)
			.max(20)
			.required(),
		agency: Joi.object(),
		accountStatus: Joi.string(),
	});

	return schema.validate(user);
}
