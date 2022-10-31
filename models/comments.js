const mongoose = require("mongoose");
const Joi = require("joi");

const commentSchema = new mongoose.Schema({
  complaintId: { type: Number, required: true },
  comments: [
    {
      comment: { type: String, required: true },
      commentDate: { type: Number, required: true },
      commentAuthor: { type: String, required: true },
    },
  ],
});

const Comment = mongoose.model("comment", commentSchema);

module.exports.Comment = Comment;
module.exports.validateComment = validateComment;

function validateComment(comment) {
  const schema = Joi.object({
    id: Joi.number().required(),
    date: Joi.number().required(),
    msg: Joi.string().required(),
    author: Joi.string().required(),
  });
  return schema.validate(comment);
}
