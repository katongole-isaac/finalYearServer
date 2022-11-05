const express = require("express");
const { auth } = require("../middleware/auth");
const { Comment } = require("../models/comments");

const router = express.Router();

//getting comments for a specific complaint ====Used by User===
router.get("/my", auth, async (req, res) => {
  if (!req.query.id)
    return res
      .status(400)
      .json({ error: "No id provided to fetch comments..." });

  const comments = await Comment.findOne({ complaintId: req.query.id });
  console.log(req.query.id, comments);

  // if(comments === null ) return res.json(comment)
  res.json({ comments });
});

module.exports = router;
