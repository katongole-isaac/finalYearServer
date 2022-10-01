const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const {auth} = require("../middleware/auth");


//video streaming 
router.get("/:id", async (req, res) => {
	const range = req.headers.range;
	if (!range) return res.status(400).json({ error: "Range header required" });
	let videoFile;

	const videoPath = path.join(__dirname, "../uploads");

	const files = fs.readdirSync(videoPath);

	if (files.length === 0)
		return res.status(400).json({ error: "No video found" });

	for (let file of files) {
		if (file === req.params.id) videoFile = path.join(videoPath, file);
	}

	if (!videoFile) return res.status(400).json({ error: "No video found 2" });

	//const videoContentFile = path.join("../uploads/video", videoFile);
	const videoContentSize = fs.statSync(videoFile).size;

	const CHUNK_SIZE = 10 ** 6; // 1MB

	const start = Number(range.replace(/\D/g, ""));
	const end = Math.min(start + CHUNK_SIZE, videoContentSize - 1);

	const contentLength = end - start + 1;
	const headers = {
		"Content-Range": `bytes ${start}-${end}/${videoContentSize}`,
		"Accept-Ranges": "bytes",
		"Content-Length": contentLength,
		"Content-Type": "video/webm",
	};

	res.writeHead(206, headers);

	const videoStream = fs.createReadStream(videoFile, { start, end });
	videoStream.pipe(res);

});

module.exports = router;
