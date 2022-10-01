const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const {auth} = require("../middleware/auth");

//Audio streaming
router.get("/:id", async (req, res) => {
	const range = req.headers.range;
	if (!range) return res.status(400).json({ error: "Range header required" });
	let audioFile;

	const audioPath = path.join(__dirname, "../uploads");

	const files = fs.readdirSync(audioPath);

	if (files.length === 0)
		return res.status(400).json({ error: "No audio found" });

	for (let file of files) {
		if (file === req.params.id) audioFile = path.join(audioPath, file);
	}

	if (!audioFile) return res.status(400).json({ error: "No audio found !!" });

	//const videoContentFile = path.join("../uploads/video", videoFile);
	const audioContentSize = fs.statSync(audioFile).size;

	const CHUNK_SIZE = 10 ** 6; // 1MB

	const start = Number(range.replace(/\D/g, ""));
	const end = Math.min(start + CHUNK_SIZE, audioContentSize - 1);

	const contentLength = end - start + 1;
	const headers = {
		"Content-Range": `bytes ${start}-${end}/${audioContentSize}`,
		"Accept-Ranges": "bytes",
		"Content-Length": contentLength,
		"Content-Type": "audio/webm",
	};

	res.writeHead(206, headers);

	const audioStream = fs.createReadStream(audioFile, { start, end });
	audioStream.pipe(res);
});

module.exports = router;
