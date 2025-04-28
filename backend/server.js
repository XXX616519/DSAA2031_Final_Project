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

// 模拟项目数据集，模拟 MySQL 中一个表的数据
const projectData = [
    { userId: '001', projectName: 'Project A', description: "Alice's first project" },
    { userId: '001', projectName: 'Project C', description: "Alice's second project" },
    { userId: '002', projectName: 'Project B', description: "Bob's project" },
    { userId: '001', projectName: 'Project D', description: "Alice extra project" },
    { userId: '002', projectName: 'Project E', description: "Bob extra project" }
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

// 新增 API 端点：返回指定用户参与的项目信息
app.get('/api/projects', (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ success: false, message: "Missing userId" });
    }
    const userProjects = projectData.filter(project => project.userId === userId);
    res.json({ success: true, projects: userProjects });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});