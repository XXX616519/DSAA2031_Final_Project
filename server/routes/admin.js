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
             t.name AS leadingProfessor, t.id AS leadingProfessorId,
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

router.post('/projects', async (req, res) => {
  const {
    projectId,
    projectName,
    description,
    hourPayment,
    performanceRatio,
    budget,
    participants,
    leadingProfessor
  } = req.body;

  if (!projectId ||!projectName || !hourPayment || !performanceRatio || !budget || !participants || !leadingProfessor) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Use leadingProfessor as teacher id directly
    const tid = leadingProfessor;


    // Check if the project ID already exists
    const [[existingProject]] = await connection.query(
      `SELECT id FROM projects WHERE id = ?`,
      [projectId]
    );
    if (existingProject) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Project ID already exists" });
    }

    // Insert into projects
    const [projectResult] = await connection.query(
      `INSERT INTO projects (id, name, description, hour_payment, x_coefficient, budget, tid, start_date, balance)
       VALUES (?,?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [projectId,projectName, description, hourPayment, performanceRatio, budget, tid, budget]
    );
    // const projectId = projectResult.insertId;

    // Insert participants
    if (participants.length > 0) {
      const participantValues = participants.map(sid => [projectId, sid]);
      await connection.query(
        `INSERT INTO project_participants (pid, sid) VALUES ?`,
        [participantValues]
      );
    }

    await connection.commit();
    res.json({ success: true, projectId });
  } catch (error) {
    await connection.rollback();
    console.error("Error inserting project:", error);
    switch (error.errno) {
      case 1062:
        return res.status(400).json({ success: false, message: "Duplicate participants!" });
      case 1452:
        return res.status(400).json({ success: false, message: "Please ensure the students and professor exist!" });
      default:
        return res.status(500).json({ success: false, message: "Database error", error });
    }
  } finally {
    connection.release();
  }
});

// API: 更新指定项目（仅允许修改 hourPayment, participants, performanceRatio, budget）
router.put('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { hourPayment, participants, balance, performanceRatio } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[projectInfo]] = await connection.query(
      `SELECT balance, budget FROM projects WHERE id = ?`,
      [projectId]
    );
    if (!projectInfo) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    // If balance is provided, update budget by the same difference
    let result;
    console.log("Project info:", projectInfo);
    if (balance !== undefined && balance !== null) {
      const oldBudget = parseFloat(projectInfo.budget);
      const oldBlance = parseFloat(projectInfo.balance);
      const balanceDiff = balance - oldBlance;
      const newBudget = oldBudget + balanceDiff;
      console.log(typeof newBudget);
      console.log("New budget:", newBudget);
      [result] = await connection.query(
      `
      UPDATE projects SET 
        hour_payment = COALESCE(?, hour_payment), 
        balance = COALESCE(?, balance), 
        budget = ?, 
        x_coefficient = COALESCE(?, x_coefficient)
      WHERE id = ?`,
      [hourPayment, balance, newBudget, performanceRatio, projectId]
      );
    } else {
      [result] = await connection.query(
      `
      UPDATE projects SET 
        hour_payment = COALESCE(?, hour_payment), 
        x_coefficient = COALESCE(?, x_coefficient)
      WHERE id = ?`,
      [hourPayment, performanceRatio, projectId]
      );
    }

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