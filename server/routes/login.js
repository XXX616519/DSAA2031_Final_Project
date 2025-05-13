const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const ROLENAME = ['students', 'teachers', 'admins'];

router.post('/api/login', (req, res) => {
    const { role, id, password } = req.body;
  
    pool.query(
        `SELECT * FROM ${ROLENAME[role]} WHERE studentId = ? AND studentPassword = ?`,
        [id, password],
        (error, results) => {
            if (error) {
                res.status(500).json({ success: false, message: "Database error" });
            } else if (results.length > 0) {
                res.json({ success: true });
            } else {
                res.status(401).json({ success: false, message: "Invalid credentials" });
            }
        }
);});


module.exports = router; 
