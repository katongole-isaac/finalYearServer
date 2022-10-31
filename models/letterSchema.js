const mongoose = require("mongoose");
const Joi = require("joi");

const letterSchema = new mongoose.Schema({
  from: {
    // from ==> field for an agency name
    type: String,
    minlength: 3,
    maxlength: 255,
    required: true,
    lowercase: true,
  },
  migrantName: {
    type: String,
    minlength: 3,
    maxlength: 255,
    required: true,
    lowercase: true,
  },
  createdAt: { type: String, default: Date.now },
  letters: { type: Array },
  viewed: {
    type: Boolean,
    default: false,
  },
  comment: { type: Array }, //This comment is put by ministry.
});

const LetterModel = mongoose.model("letter", letterSchema);

module.exports.LetterModel = LetterModel;
module.exports.validateLetter = validateLetter;
module.exports.validateUpdateLetterComment = validateUpdateLetterComment;

function validateLetter(letter) {
  const schema = Joi.object({
    email: Joi.string().email().required(), // email for checking whether an agency exists or no
    status: Joi.string().required(), // status of the complaint
    id: Joi.number().required(), // id of the complaintId
  });

  return schema.validate(letter);
}

function validateUpdateLetterComment(comment) {
  const schema = Joi.object({
    id: Joi.objectId().required(),
    comment: Joi.string().required(),
  });

  return schema.validate(comment);
}
