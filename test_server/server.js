const express = require('express');
const cors = require('cors');
const app = express();

`项目表参考
-- 用户表
CREATE TABLE students (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL
);

CREATE TABLE teachers (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL
);

CREATE TABLE admins (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL
);

-- 项目表
CREATE TABLE projects (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  -- x系数
  x_coefficient DECIMAL(5,2) DEFAULT 1.0, -- 教授决定
  hour_payment DECIMAL(10,2), -- admin决定
  budget DECIMAL(15,2), -- admin决定
  balance DECIMAL(15,2) DEFAULT 0.00, -- 自动计算
  tid VARCHAR(10),
  start_date DATE,
  FOREIGN KEY (tid) REFERENCES teachers(id),
  CHECK (x_coefficient > 0),
  CHECK (hour_payment > 0),
  CHECK (budget > 0).
  CHECK (balance >= 0)
);

-- 项目参与者关联表（学生）
CREATE TABLE project_participants (
  pid VARCHAR(10) NOT NULL,
  sid VARCHAR(10) NOT NULL,
  PRIMARY KEY (pid, sid),
  FOREIGN KEY (pid) REFERENCES projects(project_id),
  FOREIGN KEY (sid) REFERENCES students(id)
);

-- 工时提交历史表
CREATE TABLE workload_declaration (
  sid VARCHAR(10),
  pid VARCHAR(10),
  date DATE NOT NULL,
  hours DECIMAL(5,2),
  pscore INT,
  wage DECIMAL(10,2),
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'PAYED') DEFAULT 'PENDING',
  PRIMARY KEY (student_id, project_id, date),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

-- 工资发放历史
CREATE TABLE wage_payments (
  -- id INT AUTO_INCREMENT PRIMARY KEY,
  sid VARCHAR(10),
  pid VARCHAR(10),
  date DATE NOT NULL,
  hours DECIMAL(5,2),
  pscore INT,
  hourp DECIMAL(10,2),
  prate DECIMAL(10,2),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

`

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
  { adminId: '001', adminPassword: 'adminpass' },

];

// 新建的项目数据集，模拟 MySQL 中 project 表
let projects = [
  {
    projectId: 'P001',
    projectName: 'Project A',
    description: 'A research project on AI applications.',
    hourPayment: 50,
    performanceRatio: 2,
    budget: 10000,
    balance: 5000,
    participants: ['001', '002'], // 存 userId 数组
    leadingProfessor: 'Prof. Smith'
  },
  {
    projectId: 'P002',
    projectName: 'Project B',
    description: 'A research project on blockchain technology.',
    hourPayment: 60,
    performanceRatio: 1,
    budget: 15000,
    balance: 7000,
    participants: ['002'],
    leadingProfessor: 'Prof. Johnson'
  }
];

// 学生部分
// 模拟 MySQL 中 student_projects 表
let studentProjects = [
  {
    projectId: 'P001',
    projectName: 'Student Project A',
    leadingProfessor: 'Prof. Green',
    description: 'A research project on AI applications.',
    hourPayment: 50,
    startDate: '2025-01-15'
  },
  {
    projectId: 'P002',
    projectName: 'Student Project B',
    leadingProfessor: 'Prof. White',
    description: 'A collaborative project on renewable energy.',
    hourPayment: 60,
    startDate: '2025-02-01'
  },
  {
    projectId: 'P003',
    projectName: 'Student Project C',
    leadingProfessor: 'Prof. Black',
    description: 'A study on blockchain technology.',
    hourPayment: 70,
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
        projectId: 'P001',
        projectName: 'Student Project A',
        wage: 500,
        performanceScore: 85,
        hourPayment: 50
      },
      {
        date: '2025-04-01',
        projectId: 'P001',
        projectName: 'Student Project B',
        wage: 600,
        performanceScore: 90,
        hourPayment: 50
      }
    ]
  },
  {
    studentId: '002',
    history: [
      {
        date: '2025-03-01',
        projectId: 'P002',
        projectName: 'Student Project B',
        wage: 400,
        performanceScore: 80,
        hourPayment: 60
      },
      {
        date: '2025-04-01',
        projectId: 'P003',
        projectName: 'Student Project C',
        wage: 700,
        performanceScore: 95,
        hourPayment: 70
      }
    ]
  }
];

// 老师部分
// 模拟 MySQL 中的 teacher_project 表
let teacherProjects = [
  {
    projectId: 'P001',
    projectName: 'Teacher Project A',
    budget: 20000,
    IncentiveBonus: 2000,
    participants: ['001', '002']
  },
  {
    projectId: 'P002',
    projectName: 'Teacher Project B',
    budget: 30000,
    IncentiveBonus: 2000,
    participants: ['002', '003']
  },
  {
    projectId: 'P003',
    projectName: 'Teacher Project C',
    budget: 25000,
    IncentiveBonus: 2000,
    participants: ['001', '003']
  }
];
// 模拟 MySQL 中的 performance_scores 表
let performanceScores = [
  { projectId: 'P001', studentId: '001', performanceScore: 85, date: '2025-03' },
  { projectId: 'P001', studentId: '002', performanceScore: 90, date: '2025-03' },
  { projectId: 'P001', studentId: '001', performanceScore: 88, date: '2025-04' },
  { projectId: 'P001', studentId: '002', performanceScore: 92, date: '2025-04' },
  { projectId: 'P002', studentId: '002', performanceScore: 80, date: '2025-03' },
  { projectId: 'P002', studentId: '003', performanceScore: null, date: '2025-03' },
  { projectId: 'P002', studentId: '002', performanceScore: 85, date: '2025-04' },
  { projectId: 'P002', studentId: '003', performanceScore: 90, date: '2025-04' }
];
// 模拟 MySQL 中的 working_hours_approval 表
let uploadWorkingHoursApproval = [
  {
    projectId: 'P001',
    studentId: '001',
    workingHours: 10,
    uploadDate: '2025-04-01',
    approvalStatus: 0 // 0: 未审核, 1: 已批准, 2: 已拒绝
  },
  {
    projectId: 'P002',
    studentId: '002',
    workingHours: 8,
    uploadDate: '2025-04-02',
    approvalStatus: 1
  }
];



// // 统一登录接口，根据 role 判断验证哪一类用户
// app.post('/api/login', (req, res) => {
//   const { role } = req.body;

//   if (role === 0) {
//     const { studentId, studentName, studentPassword } = req.body;
//     const student = allowedStudents.find(s =>
//       s.studentId === studentId &&
//       s.studentName === studentName &&
//       s.studentPassword === studentPassword
//     );
//     if (student) {
//       res.json({ success: true });
//     } else {
//       res.status(401).json({ success: false, message: "Invalid credentials" });
//     }
//   } else if (role === 1) {
//     const { teacherId, teacherName, teacherPassword } = req.body;
//     const teacher = allowedTeachers.find(t =>
//       t.teacherId === teacherId &&
//       t.teacherName === teacherName &&
//       t.teacherPassword === teacherPassword
//     );
//     if (teacher) {
//       res.json({ success: true });
//     } else {
//       res.status(401).json({ success: false, message: "Invalid credentials" });
//     }
//   } else if (role === 2) {
//     const { id, password } = req.body;
//     const admin = allowedAdmins.find(a =>
//       a.adminId === id &&
//       a.adminPassword === password
//     );
//     console.log("admin", admin);
//     console.log("adminId", id);
//     console.log("adminPassword", password);
//     console.log("allowedAdmins", allowedAdmins);
//     if (admin) {
//       res.json({ success: true });
//     } else {
//       res.status(401).json({ success: false, message: "Invalid credentials" });
//     }
//   } else {
//     res.status(400).json({ success: false, message: "Unknown role" });
//   }
// });
app.post('/api/login', (req, res) => {
  const { role, id, password } = req.body;

  let user;
  if (role === 0) {
    user = allowedStudents.find(student => student.studentId === id && student.studentPassword === password);
  } else if (role === 1) {
    user = allowedTeachers.find(teacher => teacher.teacherId === id && teacher.teacherPassword === password);
  } else if (role === 2) {
    user = allowedAdmins.find(admin => admin.adminId === id && admin.adminPassword === password);
  }

  if (user) {
    res.json({ success: true, name: user.studentName || user.teacherName || "Admin" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});



//管理员端口
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
// API: 更新指定项目（仅允许修改 hourPayment, participants,peformanceRatio, budget）
app.put('/api/projects/:projectId', (req, res) => {
  const { projectId } = req.params;
  const { hourPayment, participants, balance, performanceRatio } = req.body;
  const project = projects.find(p => p.projectId === projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }
  // 更新字段（你可以增加权限校验，确保请求者是admin）
  if (hourPayment !== undefined) project.hourPayment = hourPayment;
  if (balance !== undefined) project.balance = balance;
  if (participants !== undefined) project.participants = participants;
  if (performanceRatio !== undefined) project.performanceRatio = performanceRatio;

  res.json({ success: true, project });
});

// API: 添加新项目
app.post('/api/projects', (req, res) => {
  const { projectId, projectName, description, hourPayment, performanceRatio, budget, participants, leadingProfessor } = req.body;
  // 检查必填字段
  if (!projectId || !projectName) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  // 判断是否已存在
  if (projects.find(p => p.projectId === projectId)) {
    return res.status(400).json({ success: false, message: "Project ID already exists" });
  }
  // 计算初始余额
  const initialBalance = budget;
  // 新建项目对象
  const newProject = { projectId, projectName, description, hourPayment, performanceRatio, budget, participants, leadingProfessor, balance: initialBalance };
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
// API: 获取学生的工作时长记录
app.get('/api/student-working-hours/:studentId', (req, res) => {
  const { studentId } = req.params;

  // 筛选出该学生的工作时长记录
  const studentHours = uploadWorkingHoursApproval.filter(entry => entry.studentId === studentId);

  if (studentHours.length > 0) {
    res.json({ success: true, workingHours: studentHours });
  } else {
    res.json({ success: false, message: "No working hours found for this student." });
  }
});
// API: 上传工作时长（学生端）
app.post('/api/upload-working-hours', (req, res) => {
  const { projectId, studentId, workingHours, yearMonth } = req.body;

  if (!projectId || !studentId || !workingHours || !yearMonth) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const existingEntry = uploadWorkingHoursApproval.find(
    entry => entry.projectId === projectId && entry.studentId === studentId && entry.uploadDate === yearMonth
  );

  if (existingEntry) {
    // 更新已有记录
    existingEntry.workingHours = workingHours;
    existingEntry.approvalStatus = 0; // 重置为未审核
  } else {
    // 新增记录
    uploadWorkingHoursApproval.push({
      projectId,
      studentId,
      workingHours,
      uploadDate: yearMonth,
      approvalStatus: 0
    });
  }
  res.json({ success: true, message: "Working hours uploaded successfully" });
});



// 教师项目数据接口
// API: 返回教师管理的项目
app.get('/api/teacher-projects', (req, res) => {
  res.json({ success: true, projects: teacherProjects });
});

// API: 获取指定项目的学生详细信息，包括工作时长、审核状态和绩效分数
app.get('/api/project-student-details/:projectId', (req, res) => {
  const { projectId } = req.params;
  const { yearMonth } = req.query; // 从查询参数中获取年月（格式：YYYY-MM）

  // 获取项目的参与学生
  const project = teacherProjects.find(p => p.projectId === projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  // 获取学生的详细信息
  const students = project.participants.map(studentId => {
    const student = allowedStudents.find(s => s.studentId === studentId);

    // 获取学生的工作时长记录
    const workingHoursEntry = uploadWorkingHoursApproval.find(
      entry => entry.projectId === projectId && entry.studentId === studentId && entry.uploadDate.startsWith(yearMonth)
    );

    // 获取学生的绩效分数
    const performanceEntry = performanceScores.find(
      ps => ps.projectId === projectId && ps.studentId === studentId && ps.date === yearMonth
    );

    return {
      studentId,
      studentName: student ? student.studentName : "Unknown",
      workingHours: workingHoursEntry ? workingHoursEntry.workingHours : null,
      approvalStatus: workingHoursEntry ? workingHoursEntry.approvalStatus : null,
      performanceScore: performanceEntry ? performanceEntry.performanceScore : null
    };
  });

  res.json({ success: true, students });
});

// API: 更新学生的 Approval Status 和 Performance Score
app.put('/api/project-students/:projectId/:studentId', (req, res) => {
  const { projectId, studentId } = req.params;
  const { approvalStatus, performanceScore } = req.body;

  // 检查项目和学生是否存在
  const project = teacherProjects.find(p => p.projectId === projectId);
  const student = allowedStudents.find(s => s.studentId === studentId);
  if (!project || !student) {
    return res.status(404).json({ success: false, message: "Project or student not found" });
  }

  // 更新工作时长的审核状态
  const workingHoursEntry = uploadWorkingHoursApproval.find(
    entry => entry.projectId === projectId && entry.studentId === studentId
  );
  if (workingHoursEntry) {
    workingHoursEntry.approvalStatus = approvalStatus;
  }

  // 更新或新增绩效分数
  const performanceEntry = performanceScores.find(
    ps => ps.projectId === projectId && ps.studentId === studentId
  );
  if (performanceEntry) {
    performanceEntry.performanceScore = performanceScore;
  } else {
    performanceScores.push({ projectId, studentId, performanceScore });
  }

  res.json({ success: true, message: "Student information updated successfully" });
});

// API: 获取指定项目的工资发放状态
app.get('/api/wage-payment-status/:projectId', (req, res) => {
  const { projectId } = req.params;
  const { yearMonth } = req.query; // 从查询参数中获取年月（格式：YYYY-MM）
  console.log('Received yearMonth:', yearMonth);

  // 获取项目的参与学生
  const project = teacherProjects.find(p => p.projectId === projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  // 模拟工资发放状态数据
  const status = project.participants.map(studentId => {
    const paymentEntry = monthlyWageHistory.flatMap(student => student.history)
      .find(entry => entry.projectId === projectId && entry.date.startsWith(yearMonth));

    return {
      studentId,
      paymentStatus: paymentEntry ? 'Paied' : 'Unpaid'
    };
  });

  res.json({ success: true, status });
});

// API: 更新工资状态为 "Paied"
app.put('/api/mark-wage-paied/:projectId/:studentId', (req, res) => {
  const { projectId, studentId } = req.params;
  const { yearMonth } = req.query;

  // 模拟工资发放状态数据
  const paymentEntry = monthlyWageHistory.flatMap(student => student.history)
    .find(entry => entry.projectId === projectId && entry.studentId === studentId && entry.date.startsWith(yearMonth));

  if (!paymentEntry) {
    return res.status(404).json({ success: false, message: 'Payment record not found.' });
  }

  // 更新工资状态为 "Paied"
  paymentEntry.paymentStatus = 'Paied';

  res.json({ success: true, message: 'Payment status updated to "Paied".' });
});

// 管理员数据接口
// 新增 API: 获取年度报告数据（模拟数据，根据年份返回不同内容）
app.get('/api/annual-report', (req, res) => {
  const { year } = req.query;
  if (!year) {
    return res.status(400).json({ success: false, message: "Missing year parameter" });
  }

  let report;

  // 模拟不同年份的报告数据
  if (year === "2025") {
    report = [
      { studentId: '001', studentName: 'Alice', totalWage: 1100, averageScore: 87.7 },
      { studentId: '002', studentName: 'Bob', totalWage: 1500, averageScore: 85.0 }
    ];
  } else if (year === "2024") {
    report = [
      { studentId: '001', studentName: 'Alice', totalWage: 900, averageScore: 80.2 },
      { studentId: '002', studentName: 'Bob', totalWage: 1200, averageScore: 82.5 }
    ];
  } else if (year === "2023") {
    report = [
      { studentId: '001', studentName: 'Alice', totalWage: 800, averageScore: 79.0 },
      { studentId: '002', studentName: 'Bob', totalWage: 1100, averageScore: 83.3 }
    ];
  } else if (year === "2022") {
    // 默认报告数据
    report = [
      { studentId: '001', studentName: 'Alice', totalWage: 1000, averageScore: 84.0 },
      { studentId: '002', studentName: 'Bob', totalWage: 1300, averageScore: 83.0 }
    ];
  }
  else {
    return res.status(400).json({ success: false, message: "Invalid year parameter" });
  }

  res.json({ success: true, year, report });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});
