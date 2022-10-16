const express = require("express");
const path = require("path");

const router = express.Router();

const fileStore = path.resolve(__dirname, "../docs/");
console.log(fileStore);

router.get("/", async (req, res) => {
	if (!req.query.file)
		return res.status(400).json({ error: "filename required" });
	const filePath = path.resolve(fileStore, req.query.file);

	console.log(filePath);
	res.attachment(filePath);
	res.send();
	// res.status(200).json({ msg: "ok" });
});

module.exports = router;
