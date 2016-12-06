require('dotenv').config();
if (!process.env.RECOVERY_PATH) {
  process.exit(1);
}
const path = require('path');
const fs = require('fs');
const sql = require('sqlite3');

const dbFile = path.join(process.env.RECOVERY_PATH, 'Manifest.db');
const db = new sql.Database(dbFile, (err, res) => {
  errHandler(err);
});

var query = [
  'SELECT *',
  'FROM Files',
  'WHERE domain="CameraRollDomain"',
  'AND relativePath like "Media/DCIM%"',
  ';'
].join(' ');
db.each(query, [], function(err, result) {
  errHandler(err);
  writeFile(result);
})

function errHandler (error) {
  if (error) {
    console.warn(err);
    process.exit(2);
  }
}

function writeFile(fileInfo) {
  var pwd = process.env.WRITE_PATH || process.env.PWD;
  var writePath = path.join(pwd, fileInfo.relativePath);
  console.log(writePath);
}
