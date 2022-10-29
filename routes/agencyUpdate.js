const express = require("express");
const Joi = require("joi");
const { auth } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");
const { validateId } = require("../middleware/validateId");
const { AgencyModel } = require("../models/agencySchema");
const mongoose = require("mongoose");
const config = require("config");
const bcrypt = require("bcrypt");
const { User } = require("../models/userSchema");
const { Complaint } = require("../models/complaintSchema");
const { validatePassUpdate } = require("../utils/validatePassUpdate");

const router = express.Router();
const SALT_ROUNDS = 10;
router.get("/");

router.put("/update/:id", auth, async (req, res) => {
  const { error } = validateId({ id: req.params.id }); //checking for valid Ids
  if (error) return res.status(400).json({ error: "Invalid Id" });

  const { error: bodyError } = validateAgencyUpdate(req.body); //validating the req.body
  if (bodyError)
    return res.status(400).json({ error: bodyError.details[0].message });

  const user = await AgencyModel.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "No agency found" });

  const { name, email, status, location, phone, _id } = req.body;

  const agency = await AgencyModel.findOne({ email });
  const agencyName = await AgencyModel.findOne({ name });
  const agencyPhone = await AgencyModel.findOne({ phone });

  //if the email doesnot belong to the user.
  if (agency && !agency?._id.equals(_id))
    return res.status(400).json({
      error: "email already exists",
    });

  if (agencyName && !agencyName?._id.equals(_id))
    return res.status(400).json({
      error: "agency name already exists",
    });

  if (agencyPhone && !agencyPhone?._id.equals(_id))
    return res.status(400).json({
      error: "agency phone already exists",
    });
  
 
  const db = await mongoose.createConnection(config.get("app_db")).asPromise();
  const session = await db.startSession();
  let newAgency, userAgencyNameUpdated, complaintAgencyNameUpdated;

  try {
    await session
      .withTransaction(async () => {
        newAgency = await AgencyModel.findOneAndUpdate(
          { _id: req.params.id },
          { $set: { name, email, status, location, phone } },
          {
            new: true,
          }
        ).select("-password -__v -_id");

        userAgencyNameUpdated = await User.updateMany(
          { "agency.name": agency.name },
          {
            $set: { "agency.name": newAgency.name },
          },
          { new: true }
        );

        complaintAgencyNameUpdated = await Complaint.updateMany(
          { agency: agency.name },
          {
            $set: { agency: newAgency.name },
          },
          { new: true }
        );
        return Promise.all([
          newAgency,
          userAgencyNameUpdated,
          complaintAgencyNameUpdated,
        ]);
      })
      .then((data) => {
        console.log(data);
        session.endSession();
        // console.log(newAgency);

        res.status(200).json({ success: true, result: newAgency });
      });
  } catch (ex) {
    console.log(ex);
    res.status(500).json({ success: false });
  }
});

//password update
router.put("/password/update", async (req, res) => {
  console.log(req.url);
  const { error } = validatePassUpdate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const agency = await AgencyModel.findById(req.body.id).select("password");
  if (!agency) return res.status(404).json({ error: "User not found!" });

  const isMatch = await bcrypt.compare(req.body.oldPass, agency.password);

  if (!isMatch)
    return res.status(400).json({ error: "doesn't match old password" });

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hashOfNewPass = await bcrypt.hash(req.body.newPass, salt);

  const updateUser = await AgencyModel.findByIdAndUpdate(
    { _id: req.body.id },
    {
      $set: {
        password: hashOfNewPass,
      },
    },
    { new: true }
  );

  res.status(200).json({ id: updateUser._id });
});

//used by ministry to delete agency acc
router.delete("/delete", [auth, isAdmin], async (req, res) => {
  const { error } = validateId({ id: req.body.id }); //checking for valid Ids
  if (error) return res.status(400).json({ error: "Invalid Id" });

  const user = await AgencyModel.findByIdAndDelete(req.body.id);
  if (!user) return res.status(404).json({ error: "No user found !" });

  res.status(200).json({ id: user._id }); //user._id
});

module.exports = router;

function validateAgencyUpdate(agency) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(40).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{4,6}$/i)
      .max(20)
      .required(),
    location: Joi.string().min(3).max(40).required(),
    createdAt: Joi.date().required(),
    status: Joi.string().required(),
    _id: Joi.objectId().required(),
  });
  return schema.validate(agency);
}
