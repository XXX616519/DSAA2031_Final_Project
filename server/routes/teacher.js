const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 教师项目数据接口
// API: 返回教师管理的项目
router.get('/teacher-projects/:teacherId', async (req, res) => {
  console.log("Fetching projects for teacher:", req.params.teacherId);
  const { teacherId } = req.params;
  try {
    const [rows] = await pool.query(
      `
      SELECT 
      p.id AS projectId, 
      p.name AS projectName, 
      p.budget, 
      GROUP_CONCAT(CONCAT(s.id, ' (', s.name, ')') SEPARATOR ', ') AS participants
      FROM projects p
      LEFT JOIN project_participants pp ON p.id = pp.pid
      LEFT JOIN students s ON pp.sid = s.id
      WHERE p.tid = ?
      GROUP BY p.id
      `,
      [teacherId]
    );
    console.log(rows);
    console.log('teacherId:', teacherId);
    res.json({ success: true, projects: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API: 获取指定项目的学生信息及 performance score（按月份筛选）
router.get('/project-students/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { month } = req.query; // 从查询参数中获取月份（格式：YYYY-MM）

  try {
    const [students] = await pool.query(
      `
      SELECT pp.sid AS studentId, s.name AS studentName, wd.pscore AS performanceScore, wd.date
      FROM project_participants pp
      JOIN students s ON pp.sid = s.id
      LEFT JOIN workload_declaration wd ON pp.sid = wd.sid AND pp.pid = wd.pid
      WHERE pp.pid = ? AND (? IS NULL OR DATE_FORMAT(wd.date, '%Y-%m') = ?)
      `,
      [projectId, month, month]
    );

    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API: 更新学生的 performance score
router.put('/project-students/:projectId/:studentId', async (req, res) => {
  const { projectId, studentId } = req.params;
  const { performanceScore, date } = req.body;

  try {
    const [result] = await pool.query(
      `
      INSERT INTO workload_declaration (sid, pid, date, pscore)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE pscore = ?
      `,
      [studentId, projectId, date, performanceScore, performanceScore]
    );

    res.json({ success: true, message: "Performance score updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API: 老师获得指定项目的学生工作时长及审核状态
router.get('/project-working-hours/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    const [workingHours] = await pool.query(
      `
      SELECT wd.sid AS studentId, s.name AS studentName, wd.hours AS workingHours, wd.date AS uploadDate, wd.status AS approvalStatus
      FROM workload_declaration wd
      JOIN students s ON wd.sid = s.id
      WHERE wd.pid = ?
      `,
      [projectId]
    );

    res.json({ success: true, workingHours });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API: 教师审核学生的工作时长
// PENDING: 未审核, APPROVED: 已批准, REJECTED: 已拒绝
router.put('/project-working-hours/:projectId/:studentId', async (req, res) => {
  const { projectId, studentId } = req.params;
  const { status, date } = req.body;

  if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid approval status" });
  }

  try {
    const [result] = await pool.query(
      `
      UPDATE workload_declaration
      SET status = ?
      WHERE pid = ? AND sid = ? AND date = ?
      `,
      [status, projectId, studentId, date]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Entry not found" });
    }

    res.json({ success: true, message: "Approval status updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
