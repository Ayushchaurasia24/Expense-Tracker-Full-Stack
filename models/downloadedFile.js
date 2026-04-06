const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const DownloadedFile = sequelize.define("downloadedFile", {
  fileUrl: Sequelize.STRING
});

module.exports = DownloadedFile;