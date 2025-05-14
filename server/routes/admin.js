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

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT studentId, studentName, totalWage, averageScore 
       FROM annual_reports 
       WHERE year = ?`,
      [year]
    );

    await connection.commit();

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "No data found for the specified year" });
    }

    res.json({ success: true, year, report: rows });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: "Database error", error });
  } finally {
    connection.release();
  }
});

// 修改 GET /projects 接口，返回每个项目时，将 participants 映射为“ID (姓名)”的形式
router.get('/projects', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [projects] = await connection.query(`
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

    await connection.commit();

    res.json({ success: true, projects });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: "Database error", error });
  } finally {
    connection.release();
  }
});

// API: 更新指定项目（仅允许修改 hourPayment, participants, performanceRatio, budget）
router.put('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { hourPayment, participants, budget, performanceRatio } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(`
      UPDATE projects SET 
        hour_payment = COALESCE(?, hour_payment), 
        budget = COALESCE(?, budget), 
        x_coefficient = COALESCE(?, x_coefficient)
      WHERE id = ?`,
      [hourPayment, budget, performanceRatio, projectId]
    );

    if (participants) {
      await connection.query(`DELETE FROM project_participants WHERE pid = ?`, [projectId]);
      const participantValues = participants.map(sid => [projectId, sid]);
      await connection.query(`INSERT INTO project_participants (pid, sid) VALUES ?`, [participantValues]);
    }

    await connection.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    switch (error.errno) {
      case 1062:
        return res.status(400).json({ success: false, message: "Duplicate participants!" });
      case 1452:
        return res.status(400).json({ success: false, message: "Please ensure the students exist!" });
      default:
        return res.status(500).json({ success: false, message: "Database error", error });
    }
  } finally {
    connection.release();
  }
});

// API: 删除指定项目
router.delete('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(`DELETE FROM project_participants WHERE pid = ?`, [projectId]);
    const [result] = await connection.query(`DELETE FROM projects WHERE id = ?`, [projectId]);

    await connection.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: "Database error", error });
  } finally {
    connection.release();
  }
});

module.exports = router;