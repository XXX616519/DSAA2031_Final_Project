const express = require('express');
const router = express.Router();
const pool = require('../config/db');


  // 教师项目数据接口
  // API: 返回教师管理的项目
router.get('/api/teacher-projects', (req, res) => {
    res.json({ success: true, projects: teacherProjects });
  });

// API: 获取指定项目的学生信息及 performance score（按月份筛选）
router.get('/api/project-students/:projectId', (req, res) => {
  const { projectId } = req.params;
  const { month } = req.query; // 从查询参数中获取月份（格式：YYYY-MM）

  // 获取项目的参与学生
  const project = teacherProjects.find(p => p.projectId === projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  // 获取学生的详细信息及 performance score
  const students = performanceScores
    .filter(ps => ps.projectId === projectId && (!month || ps.date === month)) // 按月份筛选
    .map(ps => {
      const student = allowedStudents.find(s => s.studentId === ps.studentId);
      return {
        studentId: ps.studentId,
        studentName: student ? student.studentName : "Unknown",
        performanceScore: ps.performanceScore,
        date: ps.date
      };
    });

  res.json({ success: true, students });
});

  // API: 更新学生的 performance score
router.put('/api/project-students/:projectId/:studentId', (req, res) => {
    const { projectId, studentId } = req.params;// 获取项目ID和学生ID到请求路径参数中
    const { performanceScore } = req.body; // 请求体中传入的 performance score

    // 检查项目和学生是否存在
    const project = teacherProjects.find(p => p.projectId === projectId);
    const student = allowedStudents.find(s => s.studentId === studentId);
    if (!project || !student) {
      return res.status(404).json({ success: false, message: "Project or student not found" });
    }

    // 更新或新增 performance score
    const performance = performanceScores.find(
      ps => ps.projectId === projectId && ps.studentId === studentId
    );
    if (performance) {
      performance.performanceScore = performanceScore;
    } else {
      performanceScores.push({ projectId, studentId, performanceScore });
    }

    res.json({ success: true, message: "Performance score updated successfully" });
  });

  // API: 老师获得指定项目的学生工作时长及审核状态
router.get('/api/project-working-hours/:projectId', (req, res) => {
    const { projectId } = req.params;
  
    const projectWorkingHours = uploadWorkingHoursrouterroval
      .filter(entry => entry.projectId === projectId)
      .map(entry => {
        const student = allowedStudents.find(s => s.studentId === entry.studentId);
        return {
          studentId: entry.studentId,
          studentName: student ? student.studentName : "Unknown",
          workingHours: entry.workingHours,
          uploadDate: entry.uploadDate,
          routerrovalStatus: entry.routerrovalStatus
        };
      });
  
    res.json({ success: true, workingHours: projectWorkingHours });
  });

  // API: 教师审核学生的工作时长
  // 0: 未审核, 1: 已批准, 2: 已拒绝
router.put('/api/project-working-hours/:projectId/:studentId', (req, res) => {
    const { projectId, studentId } = req.params;
    const { routerrovalStatus } = req.body;
  
    if (![0, 1, 2].includes(routerrovalStatus)) {
      return res.status(400).json({ success: false, message: "Invalid routerroval status" });
    }
  
    const entry = uploadWorkingHoursrouterroval.find(
      e => e.projectId === projectId && e.studentId === studentId
    );
  
    if (!entry) {
      return res.status(404).json({ success: false, message: "Entry not found" });
    }
  
    entry.routerrovalStatus = routerrovalStatus;
    res.json({ success: true, message: "routerroval status updated successfully" });
  });
