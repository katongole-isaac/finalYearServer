const winston = require("winston");
const path = require("path");

//logging implementation
const { format } = winston;
const { combine, timestamp, label, json, printf } = format;

//formatted log
const customMyFormat = combine(
  timestamp(),
  printf(
    ({ level, timestamp, message }) =>
      `${new Date(
        timestamp
      ).toLocaleString()} [${level.toUpperCase()}] ${message} `
  )
);

const logger = winston.createLogger({
  format: customMyFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: `${path.join(__dirname, "app_error.log")}`,
      level: "error",
    }),
    new winston.transports.File({
      filename: `${path.join(__dirname, "app_info.log")}`,
      level: "info",
    }),
  ],

  exceptionHandlers: [
    new winston.transports.File({
      filename: `${path.join(__dirname, "exceptions.log")}`,
    }),
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: `${path.join(__dirname, "rejections.log")}`,
    }),
  ],
});

module.exports.logger = logger;
