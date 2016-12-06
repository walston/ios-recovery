require('dotenv').config();
if (!process.env.RECOVERY_PATH) {
  process.exit(1);
}
const path = require('path');
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
db.each(query, [], function(err, results) {
  errHandler(err);
  console.log(results);
})

function errHandler (error) {
  if (error) {
    console.warn(err);
    process.exit(2);
  }
}
