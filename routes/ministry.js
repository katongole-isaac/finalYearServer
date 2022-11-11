const express = require("express");
const { auth } = require("../middleware/auth");
const { Complaint } = require("../models/complaintSchema");
const { AgencyModel } = require("../models/agencySchema");
const { isAdmin } = require("../middleware/isAdmin");
const { User } = require("../models/userSchema");
const { LetterModel } = require("../models/letterSchema");

const router = express.Router();

// showing statistics on the ministry dashboard
router.get("/", [auth, isAdmin], async (req, res) => {
  const totalComplaints = await Complaint.find({}).count();
  const totalAgencies = await AgencyModel.find({}).count();
  const complaintsArray = await Complaint.find({}); // used to get the specific number of complaints for an agency
  const migrants = await User.find({}).count();
  const agenciesNames = await AgencyModel.find({})
    .select("name")
    .sort({ name: 1 });

  const pendingComplaints = await Complaint.find({ status: "pending" }).count();
  const forwardedComplaints = await Complaint.find({
    status: "forwarded",
  }).count();
  const seenComplaints = await Complaint.find({
    status: "seen",
  }).count();

  const workedUponComplaints = await Complaint.find({
    status: "worked-upon",
  }).count();

  //getting an agency in the form { agency: 'agencyName', count: 30} ==  for graph in the ministry dashbrd

  if (agenciesNames.length === 0 || agenciesNames === null)
    return res.status(200).json({ error: [] });

  let agencyStat = [],
    migrantsPerAgency = [];

  for (let agency of agenciesNames) {
    let complaintsCount = complaintsArray.filter(
      (complaint) => complaint.agency === agency.name
    ).length;
    agencyStat.push({ agency, complaintsCount });
  }

  // data for a bar graph showing migrants against agency.
  for (let agency of agenciesNames) {
    let migrantsCount = await User.find({ "agency.name": agency.name }).count();
    migrantsPerAgency.push({ agency: agency.name, migrantsCount });
  }

  res.status(200).json({
    agencyStat,
    totalComplaints,
    totalAgencies,
    migrants,
    pendingComplaints,
    forwardedComplaints,
    workedUponComplaints,
    seenComplaints,
    migrantsPerAgency,
  });
});

//listing agenciesNames to get their letters.
router.get("/agencies", [auth, isAdmin], async (req, res) => {
  let agenciesNames = await AgencyModel.find({})
    .sort({ name: 1 })
    .select("-password -__v");

  if (agenciesNames.length === 0 || agenciesNames === null)
    return res.status(200).json({ agenciesNames: [] });

  const letters = await LetterModel.find({}).select("-__v -id");

  if (letters.length !== 0) {
    agenciesNames = agenciesNames.filter((agency) => {
      return letters.some((letter) => letter.from === agency.name);
    });
  }

  return res.status(200).json({ agenciesNames });
});

//getting letter of a specific agency
router.get("/agency/:name", [auth, isAdmin], async (req, res) => {
  console.log(req.params.name);
  if (!req.params.name)
    return res.status(400).json({ error: "No agencyName given.." });
  const letters = await LetterModel.find({ from: req.params.name });
  console.log(letters);
  if (letters.length === 0 || letters === null)
    return res.status(200).json({ letters: [] });

  return res.status(200).json({ letters });
});

module.exports = router;
