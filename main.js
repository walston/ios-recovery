require('dotenv').config();
if (!process.env.RECOVERY_PATH) {
  process.exit(1);
}
const path = require('path');
const sql = require('sqlite3');
const express = require('express');

const app = express();

const dbFile = path.join(process.env.RECOVERY_PATH, 'Manifest.db');
const db = new sql.Database(dbFile, (err, res) => {
  if (err) {console.warn('Failed to connect to DB'); console.warn(err); }
});

var query = [
  'SELECT *',
  'FROM Files',
  'WHERE domain="CameraRollDomain"',
  'AND relativePath like "Media/DCIM%"',
  ';'
].join(' ');


app.engine('pug', require('pug').__express);

app.all('/', (req, res) => {
  var q = new Promise(function(resolve, reject) {
    var rows = [];
    db.each(query, [],
      function queryEach(err, result) {
        if (err) {console.warn('Failed to Query'); console.warn(err); }
        else rows.push(result);
      },
      function queryComplete(err, affectedRows) {
        console.log('rows.length: ' + rows.length)
        if (err) reject('Error on completion');
        else resolve(rows);
      }
    );

  });
  q.then(function queryCompleted(rows) {
    console.log(rows)
    res.render('index.pug', {images: rows}, (err, html) => {
      if (err) {
        console.warn(err);
      }
      else {
        res.send(html);
      }
    });
  }).catch( function queryFailed(err) {
    console.log(err)
    res.status(500).send(err)
  });
});

app.listen('8080', () => {
  console.log('Listening on port 8080');
})
