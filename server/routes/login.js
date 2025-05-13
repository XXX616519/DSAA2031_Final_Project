const express = require('express');
const router = express.Router();
const pool = require('../config/db');


router.post('/api/login', (req, res) => {
    const { role } = req.body;
  
    if (role === 'student') {
        const { studentId, studentPassword } = req.body;
        pool.query(
            'SELECT * FROM students WHERE studentId = ? AND studentPassword = ?',
            [studentId, studentPassword],
            (error, results) => {
                if (error) {
                    res.status(500).json({ success: false, message: "Database error" });
                } else if (results.length > 0) {
                    res.json({ success: true });
                } else {
                    res.status(401).json({ success: false, message: "Invalid credentials" });
                }
            }
        );
    } else if (role === 'teacher') {
        const { teacherId, teacherPassword } = req.body;
        pool.query(
            'SELECT * FROM teachers WHERE teacherId = ? AND teacherPassword = ?',
            [teacherId, teacherPassword],
            (error, results) => {
                if (error) {
                    res.status(500).json({ success: false, message: "Database error" });
                } else if (results.length > 0) {
                    res.json({ success: true });
                } else {
                    res.status(401).json({ success: false, message: "Invalid credentials" });
                }
            }
        );
    } else if (role === 'admin') {
        const { adminId, adminPassword } = req.body;
        pool.query(
            'SELECT * FROM admins WHERE adminId = ? AND adminPassword = ?',
            [adminId, adminPassword],
            (error, results) => {
                if (error) {
                    res.status(500).json({ success: false, message: "Database error" });
                } else if (results.length > 0) {
                    res.json({ success: true });
                } else {
                    res.status(401).json({ success: false, message: "Invalid credentials" });
                }
            }
        );
    } else {
        res.status(400).json({ success: false, message: "Unknown role" });
    }
});


module.exports = router; 
