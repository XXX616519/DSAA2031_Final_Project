const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求体

// 模拟允许登录的各角色列表
const allowedStudents = [
    { studentId: '001', studentName: 'Alice', studentPassword: 'pass123' },
    { studentId: '002', studentName: 'Bob', studentPassword: 'pass456' },
    { studentId: '003', studentName: 'pyw', studentPassword: 'passstu' }
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

// 学生部分
// 模拟 MySQL 中 student_projects 表
let studentProjects = [
  {
      projectId: 'SP001',
      projectName: 'Student Project A',
      leadingProfessor: 'Prof. Green',
      description: 'A research project on AI applications.',
      startDate: '2025-01-15'
  },
  {
      projectId: 'SP002',
      projectName: 'Student Project B',
      leadingProfessor: 'Prof. White',
      description: 'A collaborative project on renewable energy.',
      startDate: '2025-02-01'
  },
  {
      projectId: 'SP003',
      projectName: 'Student Project C',
      leadingProfessor: 'Prof. Black',
      description: 'A study on blockchain technology.',
      startDate: '2025-03-10'
  }
];
// 模拟 MySQL 中的 monthly_wage_history 表
let monthlyWageHistory = [
  {
    studentId: '001',
    history: [
      {
        date: '2025-03-01',
        projectId: 'SP001',
        projectName: 'Student Project A',
        wage: 500,
        performanceScore: 85
      },
      {
        date: '2025-04-01',
        projectId: 'SP001',
        projectName: 'Student Project B',
        wage: 600,
        performanceScore: 90
      }
    ]
  },
  {
    studentId: '002',
    history: [
      {
        date: '2025-03-01',
        projectId: 'SP002',
        projectName: 'Student Project B',
        wage: 400,
        performanceScore: 80
      },
      {
        date: '2025-04-01',
        projectId: 'SP003',
        projectName: 'Student Project C',
        wage: 700,
        performanceScore: 95
      }
    ]
  }
];

// 老师部分
// 模拟 MySQL 中的 teacher_project 表
let teacherProjects = [
  {
    projectId: 'TP001',
    projectName: 'Teacher Project A',
    budget: 20000,
    participants: ['001', '002']
  },
  {
    projectId: 'TP002',
    projectName: 'Teacher Project B',
    budget: 30000,
    participants: ['002', '003']
  },
  {
    projectId: 'TP003',
    projectName: 'Teacher Project C',
    budget: 25000,
    participants: ['001', '003']
  }
];
// 模拟 MySQL 中的 performance_scores 表
let performanceScores = [
  { projectId: 'TP001', studentId: '001', performanceScore: 85, date: '2025-03' },
  { projectId: 'TP001', studentId: '002', performanceScore: 90, date: '2025-03' },
  { projectId: 'TP001', studentId: '001', performanceScore: 88, date: '2025-04' },
  { projectId: 'TP001', studentId: '002', performanceScore: 92, date: '2025-04' },
  { projectId: 'TP002', studentId: '002', performanceScore: 80, date: '2025-03' },
  { projectId: 'TP002', studentId: '003', performanceScore: null, date: '2025-03' },
  { projectId: 'TP002', studentId: '002', performanceScore: 85, date: '2025-04' },
  { projectId: 'TP002', studentId: '003', performanceScore: 90, date: '2025-04' }
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

// 修改 GET /api/projects 接口，返回每个项目时，将 participants 映射为“ID (姓名)”的形式
app.get('/api/projects', (req, res) => {
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

  // 学生项目数据接口
  // API: 返回学生参与的项目
  app.get('/api/student-projects', (req, res) => {
    res.json({ success: true, projects: studentProjects });
  });

  // API: 获取学生的 monthly wage history
  app.get('/api/student-wage-history/:projectId', (req, res) => {
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

  // 教师项目数据接口
  // API: 返回教师管理的项目
  app.get('/api/teacher-projects', (req, res) => {
    res.json({ success: true, projects: teacherProjects });
  });

// API: 获取指定项目的学生信息及 performance score（按月份筛选）
app.get('/api/project-students/:projectId', (req, res) => {
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
  app.put('/api/project-students/:projectId/:studentId', (req, res) => {
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
  
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});
