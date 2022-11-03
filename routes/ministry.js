const express = require("express");
const { auth } = require("../middleware/auth");
const { Complaint } = require("../models/complaintSchema");
const { AgencyModel } = require("../models/agencySchema");
const { isAdmin } = require("../middleware/isAdmin");
const { User } = require("../models/userSchema");

const router = express.Router();

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

  let agencyStat = [];
  for (let agency of agenciesNames) {
    let complaintsCount = complaintsArray.filter(
      (complaint) => complaint.agency === agency.name
    ).length;
    agencyStat.push({ agency, complaintsCount });
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
  });
});

module.exports = router;
