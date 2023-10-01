import winston from "winston";
import { appConfig } from "../config/config.js";

const customLevelsOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: "red",
    error: "red",
    warning: "yellow",
    info: "green",
    http: "blue",
    debug: "blue",
  },
};

const levelState = appConfig.AMBIENT === "production" ? "info" : "debug";
console.log("🚀 ~ file: logger.js:24 ~ levelState:", levelState);

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return JSON.stringify({
    level: level,
    message: message,
    timestamp: timestamp,
  });
});

let logger;

if (appConfig.AMBIENT === "development") {
  console.log("estoy saliendo por dev");
  logger = winston.createLogger({
    levels: customLevelsOptions.levels,
    level: levelState,
    format: winston.format.combine(
      winston.format.colorize({
        all: true,
        colors: customLevelsOptions.colors,
      }),
      winston.format.simple()
    ),
    transports: [new winston.transports.Console()],
  });
} else {
  console.log("estoy saliendo por prod");
  logger = winston.createLogger({
    levels: customLevelsOptions.levels,
    level: levelState,
    format: winston.format.combine(
      winston.format.timestamp(),
      logFormat
    ),
    transports: [
      new winston.transports.Console({
        level: levelState,
        format: winston.format.combine(
          winston.format.colorize({
            all: true,
            colors: customLevelsOptions.colors,
          }),
          winston.format.simple()
        ),
      }),
      new winston.transports.File({
        filename: "src/logs/errors.log",
        level: levelState,
      }),
    ],
  });
}

export const addLogger = (req, res, next) => {
  req.logger = logger;
  req.logger.info(`Method: ${req.method}, url: ${
    req.url
  } - time: ${new Date().toISOString()}`);
  next();
};
