const { logger } = require("../logger");

module.exports = function (err, req, res, next) {
  if (err) {
    logger.error(err);
    next(err);
  }
};
