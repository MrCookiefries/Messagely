/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();

const DB_CONFIG = {
  host: "localhost",
  user: "myuser",
  password: "password",
  database: `messagely${process.env.NODE_ENV === "test" ? "_test": ""}`
};

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1: 12;

module.exports = {
  DB_CONFIG,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};
