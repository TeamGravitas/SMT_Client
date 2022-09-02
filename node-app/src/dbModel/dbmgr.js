const sqlite = require("sqlite3");
const db = new sqlite.Database('./monitoring.db', (err) => {
  if (err) {
    console.log(`Error Occured - ${err.message}`);
  } else {
    console.log('DataBase Connected');
  }
});

exports.db = db;
