const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/projects/:studentId', async (req, res) => {
  try {
    const [projects] = await pool.query(`
      SELECT p.*, wh.status, wh.wage 
      FROM projects p
      JOIN wage_history wh ON p.project_id = wh.project_id
      WHERE wh.student_id = ?
    `, [req.params.studentId]);
    
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 