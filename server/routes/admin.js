const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // 假设你有一个数据库连接模块

// 新增表：年度报告表（用于存储年报数据）


// 新增 API: 获取年度报告数据（基于SQL查询）
router.get('/annual-report', async (req, res) => {
  const { year } = req.query;
  if (!year) {
    return res.status(400).json({ success: false, message: "Missing year parameter" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT studentId, studentName, totalWage, averageScore 
       FROM annual_reports 
       WHERE year = ?`,
      [year]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "No data found for the specified year" });
    }

    res.json({ success: true, year, report: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database error", error });
  }
});

// 修改 GET /projects 接口，返回每个项目时，将 participants 映射为“ID (姓名)”的形式
router.get('/projects', async (req, res) => {
  try {
    const [projects] = await pool.query(`
      SELECT p.id AS projectId, p.name AS projectName, p.description, p.hour_payment AS hourPayment, 
             p.budget, p.balance, p.x_coefficient AS performanceRatio, p.start_date AS startDate, 
             t.name AS leadingProfessor, 
             GROUP_CONCAT(CONCAT(s.id, ' (', s.name, ')') SEPARATOR ', ') AS participants,
             GROUP_CONCAT(s.id SEPARATOR ',') AS participantIds
      FROM projects p
      LEFT JOIN project_participants pp ON p.id = pp.pid
      LEFT JOIN students s ON pp.sid = s.id
      LEFT JOIN teachers t ON p.tid = t.id
      GROUP BY p.id
    `);
    console.log("Projects fetched successfully:", projects);

    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database error", error });
  }
});

// API: 更新指定项目（仅允许修改 hourPayment, participants, performanceRatio, budget）
router.put('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { hourPayment, participants, budget, performanceRatio } = req.body;

  try {
    const [result] = await pool.query(`
      UPDATE projects SET 
        hour_payment = COALESCE(?, hour_payment), 
        budget = COALESCE(?, budget), 
        x_coefficient = COALESCE(?, x_coefficient)
      WHERE id = ?`,
      [hourPayment, budget, performanceRatio, projectId]
    );

    if (participants) {
      await pool.query(`DELETE FROM project_participants WHERE pid = ?`, [projectId]);
      const participantValues = participants.map(sid => [projectId, sid]);
      await pool.query(`INSERT INTO project_participants (pid, sid) VALUES ?`, [participantValues]);
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true });
  } catch (error) {
    switch (error.errno) {
      case 1062:
        return res.status(400).json({ success: false, message: "Duplicate participants!" });
      case 1452:
        return res.status(400).json({ success: false, message: "Please ensure the students exist!" });
      default:
        return res.status(500).json({ success: false, message: "Database error", error });
    }
  }
});

// API: 添加新项目
router.post('/projects', async (req, res) => {
  const { projectId, projectName, description, hourPayment, performanceRatio, budget, participants, leadingProfessor } = req.body;

  // 检查必要字段是否存在
  if (!projectId || !projectName) {
    console.log("缺少必要字段: projectId 或 projectName");
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // 检查项目ID是否已存在
    const [existingProject] = await pool.query(`SELECT id FROM projects WHERE id = ?`, [projectId]);
    if (existingProject.length > 0) {
      console.log(`项目ID已存在: ${projectId}`);
      return res.status(400).json({ success: false, message: "Project ID already exists" });
    }

    // 获取负责人教师的ID
    const [teacher] = await pool.query(`SELECT id FROM teachers WHERE name = ?`, [leadingProfessor]);
    const tid = teacher.length > 0 ? teacher[0].id : null;
    console.log(`负责人教师ID: ${tid}`);

    // 初始化项目余额为预算值
    const initialBalance = budget;

    // 插入新项目数据
    await pool.query(
      `INSERT INTO projects (id, name, description, hour_payment, x_coefficient, budget, balance, tid, start_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [projectId, projectName, description, hourPayment, performanceRatio, budget, initialBalance, tid]
    );
    console.log(`新项目已添加: ${projectId}, ${projectName}`);

    // 如果有参与者，插入参与者数据
    if (participants && participants.length > 0) {
      const participantValues = participants.map(sid => [projectId, sid]);
      await pool.query(`INSERT INTO project_participants (pid, sid) VALUES ?`, [participantValues]);
      console.log(`参与者已添加: ${participants}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("数据库错误:", error);
    res.status(500).json({ success: false, message: "Database error", error });
  }
});

// API: 删除指定项目
router.delete('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    await pool.query(`DELETE FROM project_participants WHERE pid = ?`, [projectId]);
    const [result] = await pool.query(`DELETE FROM projects WHERE id = ?`, [projectId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database error", error });
  }
});

module.exports = router;