import dotenv from "dotenv"

let envFile;

switch (process.env.NODE_ENV) {
  case "production":
    envFile = ".env.production.local";
    break;
  case "mongo":
    envFile = "mongo.env";   
    break;
  case "filesystem":
    envFile = "filesystem.env";
    break;
    
  case "development":
      envFile = ".env.development.local";
  break;

  default:
    envFile = `.env.${process.env.NODE_ENV || "development"}.local`;
}

dotenv.config({
  path: envFile,
});

const appConfig = {
  API_VERSION: process.env.API_VERSION,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  ORIGIN: process.env.ORIGIN,
  DB_URL: process.env.DB_URL,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  SECRET_JWT: process.env.SECRET_JWT,
  JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME,
  PERSISTENCE: process.env.PERSISTENCE,
  EMAIL: process.env.EMAIL,
  PSW_EMAIL: process.env. PSW_EMAIL,
  SMS_ACC_SID: process.env. SMS_ACC_SID,
  SMS_AUTH_TOKEN: process.env. SMS_AUTH_TOKEN,
  SMS_PHONE: process.env. SMS_PHONE,
  AMBIENT: process.env.AMBIENT,
};

export { appConfig };