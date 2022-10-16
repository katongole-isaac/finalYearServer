module.exports.isAdmin = function (req, res, next) {
	const { isAdmin } = req.user;
	if (isAdmin) next();
	else return res.status(403).json({ error: "Access denied" });
};
