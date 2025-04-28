const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求体

// 模拟允许登录的各角色列表
const allowedStudents = [
    { studentId: '001', studentName: 'Alice', studentPassword: 'pass123' },
    { studentId: '002', studentName: 'Bob', studentPassword: 'pass456' }
];

const allowedTeachers = [
    { teacherId: '001', teacherName: 'Charlie', teacherPassword: 'pass789' },
    { teacherId: '002', teacherName: 'David', teacherPassword: 'pass1011' }
];

const allowedAdmins = [
    { adminId: '001', adminName: 'Eve', adminPassword: 'adminpass' },
    { adminId: '002', adminName: 'Frank', adminPassword: 'admin456' }
];

// 新建的项目数据集，模拟 MySQL 中 project 表
let projects = [
    {
      projectId: 'P001',
      projectName: 'Project A',
      hourPayment: 50,
      budget: 10000,
      participants: ['001', '002'], // 存 userId 数组
      leadingProfessor: 'Prof. Smith'
    },
    {
      projectId: 'P002',
      projectName: 'Project B',
      hourPayment: 60,
      budget: 15000,
      participants: ['002'],
      leadingProfessor: 'Prof. Johnson'
    }
  ];

// 统一登录接口，根据 role 判断验证哪一类用户
app.post('/api/login', (req, res) => {
    const { role } = req.body;
  
    if (role === 'student') {
        const { studentId, studentName, studentPassword } = req.body;
        const student = allowedStudents.find(s =>
            s.studentId === studentId &&
            s.studentName === studentName &&
            s.studentPassword === studentPassword
        );
        if (student) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } else if (role === 'teacher') {
        const { teacherId, teacherName, teacherPassword } = req.body;
        const teacher = allowedTeachers.find(t =>
            t.teacherId === teacherId &&
            t.teacherName === teacherName &&
            t.teacherPassword === teacherPassword
        );
        if (teacher) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } else if (role === 'admin') {
        const { adminId, adminName, adminPassword } = req.body;
        const admin = allowedAdmins.find(a =>
            a.adminId === adminId &&
            a.adminName === adminName &&
            a.adminPassword === adminPassword
        );
        if (admin) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } else {
        res.status(400).json({ success: false, message: "Unknown role" });
    }
});

// API: 返回所有项目（admin接口）
app.get('/api/projects', (req, res) => {
    res.json({ success: true, projects });
  });
  
  // API: 更新指定项目（仅允许修改 hourPayment, participants, budget）
  app.put('/api/projects/:projectId', (req, res) => {
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
  app.post('/api/projects', (req, res) => {
    const { projectId, projectName, hourPayment, budget, participants, leadingProfessor } = req.body;
    // 检查必填字段
    if (!projectId || !projectName) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    // 判断是否已存在
    if (projects.find(p => p.projectId === projectId)) {
      return res.status(400).json({ success: false, message: "Project ID already exists" });
    }
    
    const newProject = { projectId, projectName, hourPayment, budget, participants, leadingProfessor };
    projects.push(newProject);
    res.json({ success: true, project: newProject });
  });

    // API: 删除指定项目
    app.delete('/api/projects/:projectId', (req, res) => {
        const { projectId } = req.params;
    const index = projects.findIndex(p => p.projectId === projectId);
    if (index === -1) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }
    projects.splice(index, 1);
    res.json({ success: true });
  });
  
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});