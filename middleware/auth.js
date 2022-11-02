const jwt = require("jsonwebtoken");
const config = require("config");
const { User } = require("../models/userSchema");
const { logger } = require("../logger");

//Authenticating users.
module.exports.auth = async function (req, res, next) {
	const token = req.headers["x-auth-token"];
	if (!token) return res.status(401).json({ error: "No token Provided !" });

	try {
		const decoded = jwt.verify(token, config.get("appSecretKey"));
		req.user = decoded;
		next();
	} catch (ex) {
		logger.error(`Error : ${ex}`)
		return res.status(400).json({ error: "Invalid token" });
	}
};

// //
// module.exports.userAuth = async function (req, res, next) {
// 	const token = req.headers["x-auth-token"];
// 	try {
// 		const { id, status } = jwt.verify(token, config.get("appSecretKey"));

// 		if (id && status === "pending")
// 			return res.status(401).json({ error: "Waiting until you are verify" });
// 		else if (id && status === "active") next();

// 		return res.status(401).json({ error: "cannot perform such operation now" });
// 	} catch (ex) {
// 		console.log("Error: => ", ex);
// 		return res.status(403).json({ error: "Acess denied" });
// 	}
// };
