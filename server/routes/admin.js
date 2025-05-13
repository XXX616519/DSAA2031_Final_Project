const express = require('express');
const router = express.Router();
const ProjectService = require('../services/projectService');
const ROLENAME = ['students', 'teachers', 'admins'];

router.get('/projects', async (req, res) => {
  try {
    const projects = await ProjectService.getProjectsWithParticipants();
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const result = await ProjectService.createProject(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.sqlMessage || error.message 
    });
  }
});

router.get('/api/projects', (req, res) => {
  // 对每个项目进行转换
  const projectsWithParticipantsName = projects.map(project => {
    // 将每个参与者id映射为 "ID (姓名)" 格式
    const detailedParticipants = project.participants.map(pId => {
      // 从 allowedStudents 数组中查找该学生（你也可以扩展允许教师、管理员等）
      const student = allowedStudents.find(s => s.studentId === pId);
      if (student) {
        return `${pId} (${student.studentName})`;
      } else {
        return pId;
      }
    });
    
    // 返回新项目对象，将 participants 替换掉
    return { ...project, participants: detailedParticipants };
  });
  
  res.json({ success: true, projects: projectsWithParticipantsName });
});
// API: 更新指定项目（仅允许修改 hourPayment, participants, budget）
router.put('/api/projects/:projectId', (req, res) => {
  const { projectId } = req.params;
  const { hourPayment, participants, budget } = req.body;
  const project = projects.find(p => p.projectId === projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }
  // 更新字段（你可以增加权限校验，确保请求者是admin）
  if (hourPayment !== undefined) project.hourPayment = hourPayment;
  if (budget !== undefined) project.budget = budget;
  if (participants !== undefined) project.participants = participants;
  
  res.json({ success: true, project });
});

// API: 添加新项目
router.post('/api/projects', (req, res) => {
  const { projectId, projectName, description,hourPayment, budget, participants, leadingProfessor } = req.body;
  // 检查必填字段
  if (!projectId || !projectName) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  // 判断是否已存在
  if (projects.find(p => p.projectId === projectId)) {
    return res.status(400).json({ success: false, message: "Project ID already exists" });
  }
  
  const newProject = { projectId, projectName, description,hourPayment, budget, participants, leadingProfessor };
  projects.push(newProject);
  res.json({ success: true, project: newProject });
});

  // API: 删除指定项目
  router.delete('/api/projects/:projectId', (req, res) => {
      const { projectId } = req.params;
  const index = projects.findIndex(p => p.projectId === projectId);
  if (index === -1) {
      return res.status(404).json({ success: false, message: "Project not found" });
  }
  projects.splice(index, 1);
  res.json({ success: true });
});


module.exports = router; 