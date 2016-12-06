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

function queryBuilder(relativePath){
  relativePath =
  'relativePath="' + relativePath + '"'||
  'relativePath like "Media/DCIM%"'

  return [
    'SELECT *',
    'FROM Files',
    'WHERE domain="CameraRollDomain"',
    'AND', 'relativePath like "Media/DCIM%"',
    ';'
  ].join(' ');
}


app.engine('pug', require('pug').__express);

app.get('/', (req, res) => {
  var q = new Promise(function(resolve, reject) {
    var rows = [];
    db.each(queryBuilder(), [],
      function queryEach(err, result) {
        if (err) {console.warn('Failed to Query'); console.warn(err); }
        else rows.push(result);
      },
      function queryComplete(err, affectedRows) {
        if (err) reject('Error on completion');
        else resolve(rows);
      }
    );

  });
  q.then(function queryCompleted(rows) {
    res.render('index.pug', {images: rows}, (err, html) => {
      if (err) {
        console.warn(err);
      }
      else {
        res.send(html);
      }
    });
  }).catch( function queryFailed(err) {
    res.status(500).send(err)
  });
});

app.all('*', (req, res) => {
  var requestPath = req.originalUrl.substring(1);
  var q = new Promise(function(resolve, reject) {
    db.get(queryBuilder(requestPath), [],
      function(err, row) {
        if (err) reject({code: 500, err: err});
        else if (!row) {
          reject({code: 404});
        }
        else {
          resolve(row);
        }
      }
    )
  });

  q.then( row => {
    res.send(row.file);
  }).catch(errObj => {
    res.status(errObj.code).send(errObj.err);
  });
});

app.all('', (req, res) => {
  res.status(404).send(req.url);
});

app.listen('8080', () => {
  console.log('Listening on port 8080');
})
