const express = require("express");
const Joi = require("joi");
const { auth } = require("../middleware/auth");
const { validateId } = require("../middleware/validateId");
const validateReqBody = require("../middleware/validateReqBody");
const { upload } = require("../middleware/_multer");
const { validateComment, Comment } = require("../models/comments");
const { Complaint } = require("../models/complaintSchema");
const { User } = require("../models/userSchema");

const router = express.Router();

//getting complaints by searchTerm ===> Used by Agency and migrant
router.get("/search", async (req, res) => {
  //Performing a text search, you first create a text Index on the collection you want to search.
  // the search field is already indexed when creating the index in mongodb
  const complaints = await Complaint.find({
    $text: {
      $search: req.query.q,
      $caseSensitive: false,
    },
    email: req.query.email,
  }).sort("_id");

  res.status(200).json({ res: complaints });
});

//Used by agency to search for complaint by Id (number)
router.get("/agency/search", async () => {
  // await Complaint.find({});
});

//Getting complaints for an agency. used by an agency
router.get("/agency/views", auth, async (req, res) => {
  console.log(req.query.agency);
  const complaints = await Complaint.find({ agency: req.query.agency })
    .select("-__v")
    .sort("date");

  res.status(200).json({ res: complaints });
});

//Getting complaints of a specific email addr. Used by a specific user (migrant).
router.get("/views", auth, async (req, res) => {
  const complaints = await Complaint.find({ email: req.query.email })
    .select("-__v")
    .sort("date");

  res.status(200).json({ res: complaints });
});

//Getting all complaints . Viewing all complaints
router.get("/view/all", auth, async (req, res) => {
  const complaints = await Complaint.find({}).select("-__v").sort("date");

  if (complaints.length === 0)
    return res.status(200).json({ msg: "No complaints Found!!" });

  res.status(200).json({ res: complaints });
});


//Getting a specific complaint by its id. This route is used by agencies to view details for a specific complaint
router.get("/views/:id", auth, async (req, res) => {
  let proPic_url, user;
  // const { error } = validateId({ id: req.params.id }); //checking for valid Ids
  if (!req.params.id)
    return res.status(400).json({ error: `No complaint Id provided` });

  const complaint = await Complaint.findById(req.params.id)
    .select("-__v")
    .sort("date");
  const comments = await Comment.findOne({ complaintId: req.params.id }).select(
    "-__v"
  ); //comments on the migrant complaint
  console.log(comments);

  if (!complaint)
    return res
      .status(404)
      .json({ error: `No complaint with id ${req.params.id}` });

  user = await User.findById({ _id: complaint.userId });
  proPic_url = user?.profilePic || "";

  res.status(200).json({ res: complaint, profilePic: proPic_url, comments });
});


//uploading content of a complaint. Used by migrant to post a complaint
router.post("/", auth, upload.any(), validateReqBody, async (req, res) => {
  let audioUrl = "";
  let videoUrl = "";

  if (req.files.length !== 0) {
    req.files.forEach((file) => {
      file.mimetype === "video/mp4"
        ? (videoUrl = file.path)
        : (audioUrl = file.path);
    });
  }

  const user = await User.findById(req.body.id); //if the user checks, he can report his complaint
  if (!user)
    return res.status(400).json({ error: "No Allowed to post a complaint" });

  const desc = req.body?.desc;
  const { fullname, email, reason, agency } = req.body;
  const complaint = new Complaint({
    agency,
    fullname,
    email,
    reason,
    desc,
    audioUrl,
    videoUrl,
    userId: user._id,
  });

  complaint.markModified("date");
  await complaint.save();

  console.log(complaint);
  res.status(200).json(complaint);
});

//Updating the viewed status of the complaint.
//Here the complaint status changes to "seen"
router.put("/updateview", async (req, res) => {
  const { error } = validateId({ id: req.body.id });
  if (error)
    return res
      .status(400)
      .json({ error: `Invalid complaint Id provided ${req.body.id}` });

  const complaint = await Complaint.findByIdAndUpdate(
    { _id: req.body.id },
    {
      $set: {
        viewed: req.body.viewed,
        status: req.body.status,
      },
    },
    {
      new: true,
    }
  );
  res.status(200).json({ id: complaint._id, viewed: complaint.viewed });
});

//agency adding a comment
router.post("/comment", async (req, res) => {
  console.log(req.body);
  const { error } = validateComment(req.body);
  if (error) return res.status(400).json({ error: `Invalid complaint format, ${error.details[0].message}` });

  let comment = await Comment.findOneAndUpdate(
    { complaintId: req.body.id },
    {
      $push: {
        comments: {
          comment: req.body.msg,
          commentAuthor: req.body.author,
          commentDate: req.body.date,
        },
      },
    },
    { new: true }
  ).select("-__v -_id");

  if (!comment) {
    comment = new Comment({
      complaintId: req.body.id,
      comments: [
        {
          comment: req.body.msg,
          commentAuthor: req.body.author,
          commentDate: req.body.date,
        },
      ],
    });
    comment = await comment.save();
  }

  res.status(200).json({ comment });
});

module.exports = router;
