const express = require("express");
const Joi = require("joi");
const { auth } = require("../middleware/auth");
const { AgencyModel } = require("../models/agencySchema");
const { LetterModel } = require("../models/letterSchema");
const { User } = require("../models/userSchema");

const router = express.Router();

//for getting a list of names of available agencies during sign up ====NO auth required here====
router.get("/", async (req, res) => {
  const agencies = await AgencyModel.find({}).sort("name").select("name");
  if (agencies.length === 0) return res.status(200).json({ agencies: [] });

  res.status(200).json({ agencies });
});

//used by the agency for display total migrants
router.get("/migrants", auth, async (req, res) => {
  if (!req.query.name)
    return res.status(400).json({ error: "No agency name provided !" });
  const totalUser = await User.find({ "agency.name": req.query.name }).count();
  const totalLetters = await LetterModel.find({ from: req.query.name }).count();

  res.status(200).json({ totalMigrants: totalUser, totalLetters });
});

module.exports = router;
