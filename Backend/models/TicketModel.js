const db = require('../db');

const createTicket = (userId, subject, description, category, attachment, callback) => {
  const sql = `
    INSERT INTO tickets (user_id, subject, description, category, attachment)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [userId, subject, description, category, attachment], callback);
};

module.exports = {
  createTicket,
};
