"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../../config/config.js")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}
const files = [];
const sortDir = (maniDir) => {
  const folders = [];
  const CheckFile = (filePath) => fs.statSync(filePath).isFile();
  const sortPath = (dir) => {
    fs.readdirSync(dir)
      .filter((file) => file.indexOf(".") !== 0 && file !== "index.js")
      .forEach((res) => {
        const filePath = path.join(dir, res);
        if (filePath.indexOf("Schema") === -1) {
          if (CheckFile(filePath)) {
            files.push(filePath);
          } else {
            folders.push(filePath);
          }
        }
      });
  };
  folders.push(maniDir);
  let i = 0;
  do {
    sortPath(folders[i]);
    i += 1;
  } while (i < folders.length);
};
sortDir(__dirname);
files.forEach((file) => {
  const model = require(path.join(file))(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

process.on("unhandledRejection", (err) => {
  env === "development"
    ? (console.log(err), console.log(err.name, err.message))
    : null;

  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  env === "development"
    ? (console.log(err), console.log(err.name, err.message))
    : null;
  process.exit();
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;
