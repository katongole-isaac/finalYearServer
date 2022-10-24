const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    minlength: 3,
    maxlength: 255,
    required: true,
    trim: true,
    lowercase: true,
  },
  lastname: {
    type: String,
    minlength: 3,
    maxlength: 255,
    required: true,
    lowercase: true,
    trim: true,
  },
  profilePic: { type: String },
  gender: { type: String, default: "M" },
  agency: {
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, trim: true },
  },
  email: { type: String, minlength: 5, maxlength: 255, required: true },
  password: { type: String, maxlength: 1024, required: true },
  accountStatus: {
    type: String,
    minlength: 5,
    maxlength: 40,
    default: "pending", // when a user creates his own account
  },
  phone: { type: String, minlength: 10, maxlength: 20, required: true },
  passport: { type: String, minlength: 9, maxlength: 20, required: true }, // please verify Uganda passport Number
});

const maxAge = "7d";
userSchema.methods.genAuthToken = function () {
  return jwt.sign(
    { id: this._id, status: this.accountStatus },
    config.get("appSecretKey"),
    {
      expiresIn: maxAge,
    }
  );
};

const User = mongoose.model("user", userSchema);

module.exports.User = User;
module.exports.validateUser = validateUser;

function validateUser(user) {
  const schema = Joi.object({
    firstname: Joi.string().min(3).max(40).required(),
    lastname: Joi.string().min(3).max(40).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(40).required(),
    passport: Joi.string().min(9).max(20).required(),
    phone: Joi.string()
      .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/i)
      .max(20)
      .required(),
    agency: Joi.string().min(3).max(255).required(),
    gender: Joi.string().required(),
  });

  return schema.validate(user);
}
