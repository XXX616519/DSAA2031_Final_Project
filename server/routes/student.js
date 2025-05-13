const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/projects/:studentId', async (req, res) => {
  try {
    const [projects] = await pool.query(`
      SELECT p.*, wh.status, wh.wage 
      FROM projects p
      JOIN wage_history wh ON p.project_id = wh.project_id
      WHERE wh.student_id = ?
    `, [req.params.studentId]);
    
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 学生项目数据接口
  // API: 返回学生参与的项目
router.get('/api/student-projects', (req, res) => {
    res.json({ success: true, projects: studentProjects });
  });

  // API: 获取学生的 monthly wage history
router.get('/api/student-wage-history/:projectId', (req, res) => {
    const { projectId } = req.params;
  
    // 模拟从 monthlyWageHistory 中获取数据
    const wageHistory = monthlyWageHistory.flatMap(student => student.history)
      .filter(entry => entry.projectId === projectId);
  
    if (wageHistory.length > 0) {
      res.json({ success: true, history: wageHistory });
    } else {
      res.json({ success: false, message: "No wage history found for this project." });
    }
  });
  // API: 获取学生的工作时长记录
router.get('/api/student-working-hours/:studentId', (req, res) => {
    const { studentId } = req.params;
  
    // 筛选出该学生的工作时长记录
    const studentHours = uploadWorkingHourrouterroval.filter(entry => entry.studentId === studentId);
  
    if (studentHours.length > 0) {
      res.json({ success: true, workingHours: studentHours });
    } else {
      res.json({ success: false, message: "No working hours found for this student." });
    }
  });
  // API: 上传工作时长（学生端）
router.post('/api/upload-working-hours', (req, res) => {
    const { projectId, studentId, workingHours, yearMonth } = req.body;
  
    if (!projectId || !studentId || !workingHours || !yearMonth) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
  
    const existingEntry = uploadWorkingHourrouterroval.find(
      entry => entry.projectId === projectId && entry.studentId === studentId && entry.uploadDate === yearMonth
    );
  
    if (existingEntry) {
      // 更新已有记录
      existingEntry.workingHours = workingHours;
      existingEntryrouterrovalStatus = 0; // 重置为未审核
    } else {
      // 新增记录
      uploadWorkingHourrouterroval.push({
        projectId,
        studentId,
        workingHours,
        uploadDate: yearMonth,
      routerrovalStatus: 0
      });
    }
    res.json({ success: true, message: "Working hours uploaded successfully" });
  });



module.exports = router; 