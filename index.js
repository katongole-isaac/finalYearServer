const express = require("express");
const cors = require("cors");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const config = require("config");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const createUserRouter = require("./routes/signup");
const userAuthRouter = require("./routes/login");
const agencySignupRouter = require("./routes/agencySignup");
const ministrySignupRouter = require("./routes/ministrySignup");
const complaintRouter = require("./routes/complaints");
const videoStream = require("./routes/videoStream");
const agencyAccountsRouter = require("./routes/fetchAgencyAccs");
const agencyUpdateRouter = require("./routes/agencyUpdate");
const migrantImageUpload = require("./routes/migrantImageUpload");
const audioStream = require("./routes/audioStream");
const usersRouter = require("./routes/migrant");
const agencyRouter = require('./routes/agencyRouter');


const app = express();
const PORT = process.env.PORT || 3001;

mongoose
	.connect(config.get("app_db"))
	.then(() => console.log("connected to DB..."))
	.catch((ex) => console.log(ex));

app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/uploads", videoStream);
app.use("/api/uploads/audio", audioStream);

app.use("/api/user", usersRouter);
app.use("/api/user/login", userAuthRouter);
app.use("/api/complaints", complaintRouter);
app.use("/api/user/signup", createUserRouter);
app.use("/api/agency/signup", agencySignupRouter);
app.use("/api/agency/accounts", agencyAccountsRouter);
app.use("/api/ministry/signup", ministrySignupRouter);
app.use("/api/migrant/image/upload", migrantImageUpload);
app.use("/api/agency/account/update", agencyUpdateRouter);
app.use('/api/agency/all',agencyRouter);

app.listen(PORT, () => {
	console.log(`Running on Port ${PORT}`);
});
