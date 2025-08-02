const express = require('express');
const router = express.Router();
const { createTicket } = require('../models/TicketModel');
const verifyToken = require('../middleware/verifyToken');
const connection = require('../db');

// POST create a new ticket
router.post('/', verifyToken, (req, res) => {
  const { subject, description, category } = req.body;
  const userId = req.user.id;

  const query = 'INSERT INTO tickets (subject, description, category, status, user_id, created_at, updated_at) VALUES (?, ?, ?, "open", ?, NOW(), NOW())';

  connection.query(query, [subject, description, category, userId], (err, result) => {
    if (err) {
      console.error("Error creating ticket:", err);
      return res.status(500).json({ msg: "Server error" });
    }

    res.status(201).json({ msg: "Ticket created", ticketId: result.insertId });
  });
});
// GET all tickets created by current user
router.get('/user', verifyToken, (req, res) => {
  const userId = req.user.id;

  const query = 'SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC';
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching tickets:", err);
      return res.status(500).json({ msg: "Server error" });
    }

    res.json({ tickets: results });
  });
});

// GET a specific ticket by ID (only if created by user or user is admin)
router.get('/:id', verifyToken, (req, res) => {
  const ticketId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  const query = userRole === 'admin'
    ? 'SELECT * FROM tickets WHERE id = ?'
    : 'SELECT * FROM tickets WHERE id = ? AND user_id = ?';

  const params = userRole === 'admin' ? [ticketId] : [ticketId, userId];

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching ticket:", err);
      return res.status(500).json({ msg: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ msg: "Ticket not found or access denied" });
    }

    res.json({ ticket: results[0] });
  });
});

// DELETE a ticket (user can delete own, admin can delete any)
router.delete('/:id', verifyToken, (req, res) => {
  const ticketId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  const query = userRole === 'admin'
    ? 'DELETE FROM tickets WHERE id = ?'
    : 'DELETE FROM tickets WHERE id = ? AND user_id = ?';

  const params = userRole === 'admin' ? [ticketId] : [ticketId, userId];

  connection.query(query, params, (err, result) => {
    if (err) {
      console.error("Error deleting ticket:", err);
      return res.status(500).json({ msg: "Server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(403).json({ msg: "Access denied or ticket not found" });
    }

    res.json({ msg: "Ticket deleted successfully" });
  });
});

// PUT update a ticket — only admins allowed
router.put('/:id', verifyToken, (req, res) => {
  const ticketId = req.params.id;
  const userRole = req.user.role;

  if (userRole !== 'admin') {
    return res.status(403).json({ msg: "Only admin can update tickets" });
  }

  const { subject, description, status, category } = req.body;

  const query = 'UPDATE tickets SET subject=?, description=?, status=?, category=? WHERE id=?';

  connection.query(query, [subject, description, status, category, ticketId], (err, result) => {
    if (err) {
      console.error("Error updating ticket:", err);
      return res.status(500).json({ msg: "Server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Ticket not found" });
    }

    res.json({ msg: "Ticket updated successfully by admin" });
  });
});


// GET all tickets – admin only
router.get('/', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Only admin can view all tickets' });
  }

  const query = 'SELECT * FROM tickets ORDER BY created_at DESC';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching tickets:', err);
      return res.status(500).json({ msg: 'Server error' });
    }
    res.json({ tickets: results });
  });
});

// POST vote on a ticket (up or down)
router.post('/:id/vote', verifyToken, (req, res) => {
  const ticketId = req.params.id;
  const userId = req.user.id;
  const { voteType } = req.body; // expected: 'up' or 'down'

  if (!['up', 'down'].includes(voteType)) {
    return res.status(400).json({ msg: 'Invalid vote type' });
  }

  // Check if user already voted
  const checkQuery = 'SELECT * FROM votes WHERE ticket_id = ? AND user_id = ?';
  connection.query(checkQuery, [ticketId, userId], (err, results) => {
    if (err) return res.status(500).json({ msg: 'Error checking vote' });

    if (results.length > 0) {
      const existingVote = results[0];
      
      // Same vote again — remove vote
      if (existingVote.vote_type === voteType) {
        const deleteVote = 'DELETE FROM votes WHERE ticket_id = ? AND user_id = ?';
        const updateCount = voteType === 'up'
          ? 'UPDATE tickets SET votes = votes - 1 WHERE id = ?'
          : 'UPDATE tickets SET votes = votes + 1 WHERE id = ?';

        connection.query(deleteVote, [ticketId, userId], (err) => {
          if (err) return res.status(500).json({ msg: 'Error removing vote' });

          connection.query(updateCount, [ticketId], (err) => {
            if (err) return res.status(500).json({ msg: 'Error updating ticket votes' });
            return res.json({ msg: 'Vote removed' });
          });
        });

      } else {
        // Vote type changed: update vote_type
        const updateVote = 'UPDATE votes SET vote_type = ? WHERE ticket_id = ? AND user_id = ?';
        const updateTicketVotes = voteType === 'up'
          ? 'UPDATE tickets SET votes = votes + 2 WHERE id = ?'
          : 'UPDATE tickets SET votes = votes - 2 WHERE id = ?';

        connection.query(updateVote, [voteType, ticketId, userId], (err) => {
          if (err) return res.status(500).json({ msg: 'Error updating vote' });

          connection.query(updateTicketVotes, [ticketId], (err) => {
            if (err) return res.status(500).json({ msg: 'Error updating ticket votes' });
            return res.json({ msg: `Vote switched to ${voteType}` });
          });
        });
      }

    } else {
      // No vote yet, insert
      const insertVote = 'INSERT INTO votes (ticket_id, user_id, vote_type) VALUES (?, ?, ?)';
      const updateTicket = voteType === 'up'
        ? 'UPDATE tickets SET votes = votes + 1 WHERE id = ?'
        : 'UPDATE tickets SET votes = votes - 1 WHERE id = ?';

      connection.query(insertVote, [ticketId, userId, voteType], (err) => {
        if (err) return res.status(500).json({ msg: 'Error inserting vote' });

        connection.query(updateTicket, [ticketId], (err) => {
          if (err) return res.status(500).json({ msg: 'Error updating ticket votes' });
          return res.json({ msg: `Voted ${voteType}` });
        });
      });
    }
  });
});



module.exports = router;
