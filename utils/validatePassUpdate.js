const Joi = require("joi");

module.exports.validatePassUpdate = function validatePassUpdate(body) {
  const schema = Joi.object({
    id: Joi.objectId().required(),
    oldPass: Joi.string().required(),
    newPass: Joi.string().required(),
  });
  return schema.validate(body);
};
