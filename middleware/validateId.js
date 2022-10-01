const Joi = require("joi");

module.exports.validateId = function (id) {
	const schema = Joi.object({
		id: Joi.objectId().required(),
	});
	return schema.validate(id);
};
