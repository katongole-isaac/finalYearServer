const jwt = require("jsonwebtoken");
const config = require("config");
const { User } = require("../models/userSchema");

//Authenticating users.
module.exports.auth = async function (req, res, next) {
	const token = req.headers["x-auth-token"];
	try {
		const decoded = jwt.verify(token, config.get("appSecretKey"));
		req.user = decoded;
		next();
	} catch (ex) {
		console.log("Error: => ", ex);
		return res.status(400).json({ error: "Acess denied" });
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
