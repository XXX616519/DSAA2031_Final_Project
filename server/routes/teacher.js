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

// API: 获取指定项目的学生提交的等待处理的申请（按月份）
router.get('/project-students/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { month } = req.query; // 从查询参数中获取月份（格式：YYYY-MM）

  try {
    const [students] = await pool.query(
      `
      SELECT pp.sid AS studentId, s.name AS studentName, wd.date as uploadDate,
      wd.status AS approvalStatus, wd.hours AS workingHours
      FROM project_participants pp
      JOIN students s ON pp.sid = s.id
      LEFT JOIN workload_declaration wd ON pp.sid = wd.sid AND pp.pid = wd.pid
      WHERE pp.pid = ? AND (? IS NULL OR DATE_FORMAT(wd.date, '%Y-%m') = ?)
      AND wd.status = 'PENDING'
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
  const { performanceScore } = req.body;

  await pool.query(
    `
      INSERT INTO workload_declaration (sid, pid, date, pscore)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE pscore = ?
      `,
    [studentId, projectId, performanceScore, performanceScore]
  ).then((_) => res.json({ success: true, message: "Performance score updated successfully" }))
    .catch((error) => {
      console.error("Error updating performance score:", error);
      res.status(500).json({ success: false, message: error.message });
    });
});


module.exports = router;
