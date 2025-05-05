// 学生登录相关控件
const studentLoginBtn = document.getElementById('getDataBtn');
const loginForm = document.getElementById('loginForm');
const responseContainer = document.getElementById('responseContainer');

studentLoginBtn.addEventListener('click', () => {
  // 隐藏其他表单
  loginForm.style.display = 'block';
  loginFor.style.display = 'none';
  loginAdmin.style.display = 'none';
  responseContainer.textContent = '';
});

const loginBtn = document.getElementById('loginBtn');
loginBtn.addEventListener('click', async () => {
  const studentId = document.getElementById('studentId').value;
  const studentName = document.getElementById('studentName').value;
  const studentPassword = document.getElementById('studentPassword').value;
  
  if (!studentId || !studentName || !studentPassword) {
    alert('Please fill in all fields.');
    return;
  }
  
  const payload = { studentId, studentName, studentPassword, role: 'student' };
  
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    if (result.success) {
      // 保存登录信息到 localStorage
      localStorage.setItem('userId', studentId);
      localStorage.setItem('userName', studentName);
      localStorage.setItem('role', 'student');
      // 跳转到个人信息页面
      window.location.href = 'personal.html';
    } else {
      responseContainer.textContent = `Login failed: ${result.message}`;
    }
  } catch (error) {
    console.error("Error during API call:", error);
    responseContainer.textContent = "Login failed due to network error.";
  }
});

// 老师登录相关控件
const teacherLoginBtn = document.getElementById('getDataBtn1');
const loginFor = document.getElementById('loginFor');
const responseContainer1 = document.getElementById('responseContainer1');

teacherLoginBtn.addEventListener('click', () => {
  loginForm.style.display = 'none';
  loginFor.style.display = 'block';
  loginAdmin.style.display = 'none';
  responseContainer1.textContent = '';
});

const loginBtn1 = document.getElementById('loginBtn1');
loginBtn1.addEventListener('click', async () => {
  const teacherId = document.getElementById('teacherId').value;
  const teacherName = document.getElementById('teacherName').value;
  const teacherPassword = document.getElementById('teacherPassword').value;
  
  if (!teacherId || !teacherName || !teacherPassword) {
    alert('Please fill in all fields.');
    return;
  }
  
  const payload = { teacherId, teacherName, teacherPassword, role: 'teacher' };
  
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    if (result.success) {
      // 保存登录信息到 localStorage
      localStorage.setItem('userId', teacherId);
      localStorage.setItem('userName', teacherName);
      localStorage.setItem('role', 'teacher');
      // 跳转到个人信息页面
      window.location.href = 'personal.html';
    } else {
      responseContainer1.textContent = `Login failed: ${result.message}`;
    }
  } catch (error) {
    console.error("Error during API call:", error);
    responseContainer1.textContent = "Login failed due to network error.";
  }
});

// Admin登录相关控件
const adminLoginBtn = document.getElementById('getDataBtn2');
const loginAdmin = document.getElementById('loginAdmin');
const responseContainer2 = document.getElementById('responseContainer2');

adminLoginBtn.addEventListener('click', () => {
  loginForm.style.display = 'none';
  loginFor.style.display = 'none';
  loginAdmin.style.display = 'block';
  responseContainer2.textContent = '';
});

const loginBtn2 = document.getElementById('loginBtn2');
loginBtn2.addEventListener('click', async () => {
  const adminId = document.getElementById('adminId').value;
  const adminName = document.getElementById('adminName').value;
  const adminPassword = document.getElementById('adminPassword').value;
  
  if (!adminId || !adminName || !adminPassword) {
    alert('Please fill in all fields.');
    return;
  }
  
  const payload = { adminId, adminName, adminPassword, role: 'admin' };
  
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    if (result.success) {
      // 保存登录信息到 localStorage
      localStorage.setItem('userId', adminId);
      localStorage.setItem('userName', adminName);
      localStorage.setItem('role', 'admin');
      // 跳转到个人信息页面
      window.location.href = 'personal.html';
    } else {
      responseContainer2.textContent = `Login failed: ${result.message}`;
    }
  } catch (error) {
    console.error("Error during API call:", error);
    responseContainer2.textContent = "Login failed due to network error.";
  }
});