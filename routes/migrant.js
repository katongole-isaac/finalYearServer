const express = require("express");
const { auth } = require("../middleware/auth");
const { User, validateUser } = require("../models/userSchema");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const mongoose = require("mongoose");
const { validateId } = require("../middleware/validateId");
const { Complaint } = require("../models/complaintSchema");
const config = require("config");

const SALT_ROUNDS = 10;
const router = express.Router();

router.get("/:id", auth, async (req, res) => {
  const { error } = validateId({ id: req.params.id });
  if (error) return res.status(400).json({ error: "Invalid Id !!!" });

  const user = await User.findOne({ _id: req.params.id }).select(
    "-__v  -password "
  );

  if (!user) return res.status(404).json({ message: "User Not Found." });

  res.status(200).json({ user });
});

router.get("/accounts/all", auth, async (req, res) => {
  console.log(req.query);
  const accounts = await User.find({
    "agency.name": req.query.name,
  })
    .limit(20)
    .sort({ email: 1 })
    .select("-__v -password");
  res.status(200).json({ accounts });
});

router.get("/accounts/view", auth, async (req, res) => {
  console.log(req.query);
  const accounts = await User.find({
    "agency.name": req.query.name,
    accountStatus: req.query.status,
  })
    .limit(20)
    .sort({ email: 1 })
    .select("-__v -password");
  res.status(200).json({ accounts });
});

router.put("/accounts/update/:id", auth, async (req, res) => {
  const { error } = validateId({ id: req.params.id }); //checking for valid Ids
  if (error) return res.status(400).json({ error: "Invalid Id" });

  const { error: ex } = validateUserUpdate(req.body);
  if (ex) return res.status(400).json(ex.details[0].message);

  console.log(req.body);
  const { firstname, lastname, email, phone, passport, accountStatus } =
    req.body;

  const user = await User.findOne().where({ email });
  console.log(`USer=======>`, user);

  if (user && !user._id.equals(req.params.id))
    return res.status(400).json({ error: `email already exists` });

  let newUser, newComplaintEmail;

  //performing transaction
  const db = await mongoose.createConnection(config.get("app_db")).asPromise();
  const session = await db.startSession();
  try {
    await session
      .withTransaction(async () => {
        const { email: oldEmail } = await User.findById(req.params.id).select({
          email: 1,
        });

        newUser = await User.findOneAndUpdate(
          { _id: req.params.id },
          {
            $set: {
              firstname,
              lastname,
              email,
              phone,
              passport,
              accountStatus,
            },
          },
          {
            new: true,
            session,
          }
        );
        newComplaintEmail = await Complaint.findOneAndUpdate(
          { email: oldEmail },
          { $set: { email: newUser.email } },
          { new: true, session }
        );
        return Promise.all([newUser, newComplaintEmail]);
      })
      .then((data) => {
        console.log(data);
        session.endSession();
      })
      .then(() => {
        res.status(200).json({ success: true, result: newUser._id });
      });
  } catch (ex) {
    console.log(ex);
    session.endSession();
    res.status(500).json({ success: false });
  }
});

router.delete("/accounts/delete", async (req, res) => {
  const { error } = validateId({ id: req.body.id }); //checking for valid Ids
  if (error) return res.status(400).json({ error: "Invalid Id" });

  const user = await User.findByIdAndDelete(req.body.id);
  if (!user) return res.status(404).json({ error: "No user found !" });

  res.status(200).json({ id: user._id });
});

//updating user passwords
router.put("/update/password", async (req, res) => {
  console.log(req.body);
  const { error } = validatePassUpdate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const user = await User.findById(req.body.id).select("password");
  if (!user) return res.status(404).json({ error: "User not found!" });

  const isMatch = await bcrypt.compare(req.body.oldPass, user.password);

  if (!isMatch)
    return res.status(400).json({ error: "doesn't match old password" });

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hashOfNewPass = await bcrypt.hash(req.body.newPass, salt);

  const updateUser = await User.findByIdAndUpdate(
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

module.exports = router;

function validatePassUpdate(body) {
  const schema = Joi.object({
    id: Joi.objectId().required(),
    oldPass: Joi.string().required(),
    newPass: Joi.string().required(),
  });
  return schema.validate(body);
}

function validateUserUpdate(user) {
  const schema = Joi.object({
    id: Joi.objectId().required(),
    firstname: Joi.string().min(3).max(40).required(),
    lastname: Joi.string().min(3).max(40).required(),
    email: Joi.string().email().required(),
    passport: Joi.string().min(9).max(20).required(),
    phone: Joi.string()
      .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/i)
      .max(20)
      .required(),
    agency: Joi.object(),
    accountStatus: Joi.string(),
  });

  return schema.validate(user);
}
