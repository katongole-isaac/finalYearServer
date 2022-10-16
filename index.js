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
const agencyRouter = require("./routes/agencyRouter");
const fileUploader = require("./routes/fileUploader");
const attachmentRouter = require("./routes/attachment");
const bodyParser = require("body-parser");
const ministryViewRouter = require("./routes/ministry");
const rangeHeader = require("./middleware/rangeHeader");
const videoRangeHeader = require("./middleware/videoRangeHeader");
const letterRouter = require("./routes/letter");
const viewLetterRouter = require("./routes/viewLetter");

const app = express();
const PORT = process.env.PORT || 3001;

mongoose
	.connect(config.get("app_db"))
	.then(() => console.log("connected to DB..."))
	.catch((ex) => console.log(ex));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/docs", express.static(path.join(__dirname, "/docs")));

app.use("/api/letter", letterRouter);

app.use("/api/letters/view", viewLetterRouter); //serving letters

//This route is used by clients who click the url in the letter pdf.
// app.use("/api/uploads/audios", audioStream);
app.use("/api/video/uploads", videoRangeHeader, videoStream);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/uploads", videoStream);
app.use("/api/uploads/audio", rangeHeader, audioStream); // audio files

app.use("/api/ministry/view", ministryViewRouter);
app.use("/api/attachments", attachmentRouter);
app.use("/api/upload", fileUploader);
app.use("/api/user", usersRouter);
app.use("/api/agency/all", agencyRouter);
app.use("/api/user/login", userAuthRouter);
app.use("/api/complaints", complaintRouter);
app.use("/api/user/signup", createUserRouter);
app.use("/api/agency/signup", agencySignupRouter);
app.use("/api/agency/accounts", agencyAccountsRouter);
app.use("/api/ministry/signup", ministrySignupRouter);
app.use("/api/migrant/image/upload", migrantImageUpload);
app.use("/api/agency/account", agencyUpdateRouter);

app.listen(PORT, () => {
	console.log(`Running on Port ${PORT}`);
});
