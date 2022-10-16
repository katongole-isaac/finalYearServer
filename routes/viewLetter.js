const express = require("express");
const path = require("path");
const fs = require("fs");
const Joi = require("joi");

const router = express.Router();

router.get("/", async (req, res) => {
	const { error } = validatePathBody(req.query);
	if (error) return res.status(400).json({ error: error.details[0].message });

	const file = path.resolve(__dirname, `../${req.query.path}`);

	if (!file) return res.status(404).json({ error: "No such file !!" });

	// const fileContent = fs.readFileSync(file);
	res.status(200).sendFile(file);
});

module.exports = router;

function validatePathBody(path) {
	const schema = Joi.object({
		path: Joi.string().required(),
	});
	return schema.validate(path);
}
