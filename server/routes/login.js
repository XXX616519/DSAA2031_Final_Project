const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const ROLENAME = ['student', 'teacher', 'admin'];

router.post('/login', (req, res) => {
    console.log("Login request received");
    console.log(req.body);
    const { role, id, password } = req.body;
    pool.query(
        `SELECT * FROM ${ROLENAME[role]}s WHERE id = ? AND password = ?`,
        [id, password])
        .then(([rows]) => {
            if (rows.length > 0) {
                console.log("Login successful");
                res.json({ success: true, name:rows[0].name });
            } else {
                console.log("Login failed");
                res.status(401).json({ success: false, message: "Invalid credentials" });
            }
        })
        .catch((error) => {
            console.error("Database error:", error);
            res.status(500).json({ success: false, message: "Database error" });
        });
});


module.exports = router; 
