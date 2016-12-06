require('dotenv').config();
if (!process.env.RECOVERY_PATH) {
  process.exit(1);
}
const path = require('path');
const sql = require('sqlite3');

const dbFile = path.join(process.env.RECOVERY_PATH, 'Manifest.db');
const db = new sql.Database(dbFile, (err, res) => {
  if (err) {
    console.warn(`Error reading ${dbFile}`);
    console.warn(err);
    process.exit(2);
  }
})
