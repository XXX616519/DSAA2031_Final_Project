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
router.put('/project-students/:status', async (req, res) => {
  const { status } = req.params;
  const { projectId, studentId, date } = req.body;
  switch (status) {
    case 'approve':
      const { performanceScore } = req.body;
      await pool.query(
        `
        UPDATE workload_declaration
        SET status = 'APPROVED', pscore = ?
        WHERE status='PENDING' AND sid = ? AND pid = ? AND date = ?
        `,
        [performanceScore, studentId, projectId, date]
      ).then((_) => res.json({ success: true, message: "Application approved successfully" }))
        .catch((error) => {
          console.error("Error approving application:", error);
          res.status(500).json({ success: false, message: error.message });
        });
      break;
    case 'reject':
      await pool.query(
        `
        UPDATE workload_declaration
        SET status = 'REJECTED'
        WHERE status='PENDING' AND sid = ? AND pid = ? AND date = ?
        `,
        [studentId, projectId, date]
      ).then((_) => res.json({ success: true, message: "Application rejected successfully" }))
        .catch((error) => {
          console.error("Error rejecting application:", error);
          res.status(500).json({ success: false, message: error.message });
        });
      break;
    default:
      res.status(400).json({ success: false, message: "Invalid status" });
      break;
  }
});

// API: 获取该项目的待发放工资
router.get('/wage-paid-condition/:projectId', async (req, res) => {
  const {projectId} = req.params;
  const {month} = req.query; // 从查询参数中获取月份（格式：YYYY-MM）
  try {
    const [wages] = await pool.query(
      `
      SELECT wd.sid AS studentId, wd.hours AS declaredHours, wd.pscore AS performance, p.hour_payment * wd.hours+wd.pscore*p.x_coefficient AS wageAmount, wd.status AS wageStatus, wd.date as ApprovedDate
      FROM workload_declaration wd
      JOIN students s ON wd.sid = s.id, projects p
      WHERE p.id=wd.pid AND wd.pid = ? AND (? IS NULL OR DATE_FORMAT(wd.date, '%Y-%m') = ?) AND wd.status = 'APPROVED'
      `,
      [projectId, month, month]
    );

    res.json({ success: true, wages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API: 更新工资发放状态
// 只更新了status，没有添加时间等其他信息
router.put('/wage-paid', async (req, res) => {
  const { projectId, studentId, date } = req.body;
  try {
    // await pool.query(
    //   `
    //   UPDATE workload_declaration
    //   SET status = 'PAIED', wage = (SELECT p.hour_payment * w.hours+w.pscore*p.x_coefficient FROM workload_declaration w, projects p WHERE w.pid = p.id )
    //   WHERE status='APPROVED' AND sid = ? AND pid = ? AND date = ?
    //   `,
    //   [studentId, projectId, date]
    // );
        await pool.query(
        `UPDATE workload_declaration wd
        JOIN projects p ON wd.pid = p.id
        SET wd.wage = p.hour_payment * wd.hours + wd.pscore * p.x_coefficient
        WHERE wd.status = 'APPROVED'
        AND wd.sid = ? AND wd.pid = ? AND wd.date = ?
        `,
        [studentId, projectId, date]);
        await pool.query(`
          UPDATE workload_declaration
          SET status = 'PAID'
          WHERE status = 'APPROVED'
        `);
    res.json({ success: true, message: "Wage payment status updated successfully" });
  } catch (error) {
    console.error("Error updating wage payment status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
