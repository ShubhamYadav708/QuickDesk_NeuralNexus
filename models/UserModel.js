const db = require('../db');

const createUser = (email, hashedPassword, role, callback) => {
  const sql = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
  db.query(sql, [email, hashedPassword, role], callback);
};

const getUserByEmail = (email, callback) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

module.exports = {
  createUser,
  getUserByEmail,
};
