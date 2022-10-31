const express = require("express");
const multer = require("multer");
const { auth } = require("../middleware/auth");
const { validateId } = require("../middleware/validateId");
const {
  LetterModel,
  validateLetter,
  validateUpdateLetterComment,
} = require("../models/letterSchema");
const { AgencyModel } = require("../models/agencySchema");
const { letterUpload } = require("../middleware/letterUpload");
const { Complaint } = require("../models/complaintSchema");
const { isAdmin } = require("../middleware/isAdmin");

const router = express.Router();

router.get("/comments", async (req, res) => {
  const { error } = validateId({ id: req.query.id });
  if (error)
    return res
      .status(400)
      .json({ error: `Invalid complaint Id provided ${req.query.id}` });

  const letter = await LetterModel.findById(req.query.id);
  res.status(200).json({ comments: letter.comment });
});

router.get("/view/my", async (req, res) => {
  if (!req.query.from)
    return res.status(400).json({ error: "No Agency name provided!" });
  const letters = await LetterModel.find({ from: req.query.from });

  res.status(200).json({ letters });
});

//getting all letter. Used by ministry to view all letters.
router.get("/view/all", [auth, isAdmin], async (req, res) => {
  const letters = await LetterModel.find({})
    .limit(20)
    .sort("email")
    .select("-__v");
  res.status(200).json({ letters });
});

//Post a new letter by an agency
router.post("/post", auth, (req, res) => {
  letterUpload(req, res, async function (err) {
    console.log(req.file, req.body);
    if (err instanceof multer.MulterError)
      return res.status(500).json({ error: err.message });
    else if (err) return res.status(500).json({ error: err.message });

    if (!req.file)
      return res.status(400).json({ error: "No letters provided" });

    const { error } = validateLetter(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, id, status } = req.body;

    const agency = await AgencyModel.findOne({ email });
    if (!agency)
      return res
        .status(404)
        .json({ error: `No agency with email: ${req.body.email} ` });

    //Here we are updating the status of the complaint e.g here its from e.g ===seen=== to ===forwarded===
    const complaint = await Complaint.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          status,
        },
      }
    );

    if (!complaint)
      return res
        .status(404)
        .json({ error: `No complaint with the id: ${req.body.id}` });

    let letter = new LetterModel({
      from: agency.name,
      letters: [req.file.path],
      migrantName: complaint.fullname,
    });

    letter = await letter.save();
    res.status(200).json({ letter, complaint: complaint._id });
  });
});

//Updating the view  // it will be used by ministry
router.put("/updateview", async (req, res) => {
  const { error } = validateId({ id: req.body.id });
  if (error)
    return res
      .status(400)
      .json({ error: `Invalid complaint Id provided ${req.body.id}` });

  const letter = await LetterModel.findByIdAndUpdate(
    { _id: req.body.id },
    {
      $set: {
        viewed: req.body.viewed, //viewed : true , when letter is seen
      },
    },
    {
      new: true,
    }
  );
  res.status(200).json({ id: letter._id, viewed: letter.viewed });
});

router.put("/update/comment", async (req, res) => {
  const { error } = validateUpdateLetterComment(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  // console.log(req.body);
  // res.status(200).json({ msg: req.body });
  const updatedLetter = await LetterModel.findByIdAndUpdate(
    { _id: req.body.id },
    {
      $push: {
        comment: { commentDetails: req.body.comment, commentDate: Date.now() },
      },
    },
    {
      new: true,
    }
  );

  if (!updatedLetter)
    return res
      .status(404)
      .json({ error: `letter with Id ${req.body.id} not found` });

  res.status(200).json({ id: updatedLetter._id });
});

module.exports = router;
