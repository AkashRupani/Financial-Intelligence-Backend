const fs = require("fs");

function readRawCsv(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

module.exports = readRawCsv;
