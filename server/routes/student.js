const express = require('express');
const router = express.Router();
const pool = require('../config/db');


// 学生项目数据接口
// API: 获取学生的项目详情
router.get('/student-projects/:sid', async (req, res) => {
  const { sid } = req.params;

  const [projects] = await pool.query(`
    SELECT 
      p.id AS projectId, 
      p.name AS projectName, 
      p.description AS projectDescription, 
      p.start_date AS startDate, 
      t.name AS teacherName,
      p.hour_payment AS hourlyPayment
    FROM project_participants pp
    JOIN projects p ON pp.pid = p.id
    JOIN teachers t ON p.tid = t.id
    WHERE pp.sid = ?
  `, [sid]);

  if (projects.length > 0) {
    res.json({ success: true, projects });
  } else {
    res.json({ success: false, message: "No projects found for this student." });
  }
});

// API: 获取学生的 monthly wage history
router.get('/wage-history/:studentId', async (req, res) => {
  const { studentId } = req.params;
  const { projectId } = req.query;
  if (!projectId) {
    return res.status(400).json({ success: false, message: "Project ID is required." });
  }
  try {
    const [wageHistory] = await pool.query(`
      SELECT 
      wd.sid AS studentId, 
      wd.pid AS projectId, 
      wd.date AS paymentDate, 
      wd.hours AS workedHours, 
      wd.pscore AS performanceScore, 
      wd.wage AS amount
      FROM workload_declaration wd
      WHERE wd.status = 'PAID' AND wd.pid = ? AND wd.sid = ?
    `, [projectId, studentId]);

    if (wageHistory.length > 0) {
      res.json({ success: true, history: wageHistory });
    } else {
      res.json({ success: false, message: "No wage history found for this project." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API: 获取学生的工作时长记录
router.get('/student-working-hours/:studentId', async (req, res) => {
  const { studentId } = req.params;
  const { pid, newest } = req.query;
  try {
    const [workingHours] = await pool.query(`
      SELECT 
        wd.sid AS studentId, 
        wd.pid AS projectId, 
        wd.date AS workDate, 
        wd.hours AS workHours, 
        wd.pscore AS performanceScore, 
        wd.wage AS wageAmount, 
        wd.status AS approvalStatus 
      FROM workload_declaration wd
      WHERE wd.sid = ? AND pid = ?
      ORDER BY wd.date DESC ${newest ? 'LIMIT 1' : ''}
    `, [studentId, pid]);

    if (workingHours.length > 0) {
      res.json({ success: true, workingHours });
    } else {
      res.json({ success: false, message: "No working hours found for this student." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API: 上传工作时长（学生端）
router.post('/declare-working-hours', async (req, res) => {
  const { pid, sid, hours, date } = req.body;

  if (!pid || !sid || !hours || !date) {
    console.error("Missing required fields:", { pid, sid, hours, date });
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // Check if there is already an approved record for the same date
    const [approvedEntry] = await pool.query(`
      SELECT * 
      FROM workload_declaration 
      WHERE pid = ? AND sid = ? AND date = ? AND status = 'APPROVED'
    `, [pid, sid, date]);

    if (approvedEntry.length > 0) {
      return res.status(400).json({ success: false, message: "Cannot upload. Approved record already exists for this date." });
    }

    // Check if there is a pending record for the same date
    const [pendingEntry] = await pool.query(`
      SELECT * 
      FROM workload_declaration 
      WHERE pid = ? AND sid = ?  AND status = 'PENDING'
    `, [pid, sid]);

    if (pendingEntry.length > 0) {
      return res.status(400).json({ success: false, message: "Cannot upload. Pending record already exists." });
    }

    // Insert or update the working hours
    const [existingEntry] = await pool.query(`
      SELECT * 
      FROM workload_declaration 
      WHERE pid = ? AND sid = ? AND date = ?
    `, [pid, sid, date]);

    if (existingEntry.length > 0) {
      await pool.query(`
        UPDATE workload_declaration 
        SET hours = ?, status = 'PENDING' 
        WHERE pid = ? AND sid = ? AND date = ?
      `, [hours, pid, sid, date]);
    } else {
      await pool.query(`
        INSERT INTO workload_declaration (pid, sid, date, hours, status) 
        VALUES (?, ?, ?, ?, 'PENDING')
      `, [pid, sid, date, hours]);
    }

    res.json({ success: true, message: "Working hours uploaded successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// API: 取消申报工作时长
router.delete('/cancel-working-hours/:projectId/:studentId', async (req, res) => {
  const { projectId, studentId } = req.params;

  try {
    // 删除 PENDING 状态的申报记录
    const [result] = await pool.query(`
      DELETE FROM workload_declaration 
      WHERE pid = ? AND sid = ? AND status = 'PENDING'
    `, [projectId, studentId]);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Working hours declaration canceled successfully" });
    } else {
      res.status(400).json({ success: false, message: "No pending declaration found to cancel." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;