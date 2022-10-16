module.exports = (req, res, next) => {
	req.headers.range = "bytes=0-";
	next();
};
