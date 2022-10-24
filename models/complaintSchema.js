const mongoose = require("mongoose");
const Joi = require("joi");
const autoIncrement = require("mongoose-auto-increment");
const config = require("config");

const dbConnection = mongoose.createConnection(config.get("app_db"));
autoIncrement.initialize(dbConnection);

const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId },
  fullname: { type: String, minlength: 3, maxlength: 255, required: true },
  email: { type: String, minlength: 5, maxlength: 255, required: true },
  reason: { type: String, minlength: 5, maxlength: 255, required: true },
  date: { type: Date, default: () => new Date(), immutable: true },
  desc: { type: String },
  sent: { type: String, default: Date.now },
  viewed: { type: String, default: "new" },
  videoUrl: { type: String },
  audioUrl: { type: String },
  comment: { type: String, default: "" },
  commentDate: { type: Number },
  status: { type: String, default: "pending" }, // status: [pending, seen, worked-upon , forwaring to ministry, ]
  agency: { type: String, required: true },
  attachedFiles: {
    type: Array,
  },
});

//auto inc added
complaintSchema.plugin(autoIncrement.plugin, {
  model: "complaint",
  startAt: 220000,
  incrementBy: 1,
});

const Complaint = mongoose.model("complaint", complaintSchema);

module.exports.Complaint = Complaint;
module.exports.validateComplaint = validateComplaint;
module.exports.checkEmailAndFullname = checkEmailAndFullname;

function validateComplaint(complaint) {
  const schema = Joi.object({
    fullname: Joi.string().min(3).max(255).required(),
    email: Joi.string().min(5).max(255).required(),
    agency: Joi.string().min(5).max(255).required(),
    reason: Joi.string().min(3).max(255).required(),
    desc: Joi.string(),
    id: Joi.objectId().required(),
  });
  return schema.validate(complaint);
}

function checkEmailAndFullname(body) {
  const schema = Joi.object({
    fullname: Joi.string().min(3).max(255).required(),
    email: Joi.string().min(5).max(255).required(),
  });
  return schema.validate(body);
}
