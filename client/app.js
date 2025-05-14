// 该文件是前端的主要 JavaScript 文件，负责处理登录逻辑和与后端的交互

// 合法身份名称
const ROLENAME = ['student', 'teacher', 'admin'];


// 学生登录相关控件
const studentLoginBtn = document.getElementById('getDataBtn');
const loginForm = document.getElementById('loginForm');
studentLoginBtn.addEventListener('click', () => {
  loginForm.style.display = 'block';
  loginFor.style.display = 'none';
  loginAdmin.style.display = 'none';
  responseContainer.textContent = '';
});

// 老师登录相关控件
const teacherLoginBtn = document.getElementById('getDataBtn1');
const loginFor = document.getElementById('loginFor');
teacherLoginBtn.addEventListener('click', () => {
  loginForm.style.display = 'none';
  loginFor.style.display = 'block';
  loginAdmin.style.display = 'none';
  responseContainer1.textContent = '';
});

// Admin登录相关控件
const adminLoginBtn = document.getElementById('getDataBtn2');
const loginAdmin = document.getElementById('loginAdmin');
adminLoginBtn.addEventListener('click', () => {
  loginForm.style.display = 'none';
  loginFor.style.display = 'none';
  loginAdmin.style.display = 'block';
  responseContainer2.textContent = '';
});

// 容器数组
const containers = [
  document.getElementById('responseContainer'),
  document.getElementById('responseContainer1'),
  document.getElementById('responseContainer2')
];

// 登录按钮事件处理函数
function handleLogin(role) {
  return async () => {
    const id = document.getElementById(`${ROLENAME[role]}Id`).value;
    const rawPassword = document.getElementById(`${ROLENAME[role]}Password`).value;
    const password = CryptoJS.SHA256(rawPassword).toString(CryptoJS.enc.Hex);
    const payload = { role, id, password };
    const responseContainer = containers[role];

    if (!id || !password) {
      alert('Please fill in all fields.');
      return;
    }
    fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      }
      )
      .then(data => {
        if (data.success) {
          // 保存登录信息到 localStorage
          localStorage.setItem('userId', id);
          localStorage.setItem('userName', data.name);
          localStorage.setItem('role', role);
          // 跳转到个人信息页面
          window.location.href = 'personal.html';
        }
        else {
          console.error('Login failed:', data.message);
          responseContainer.textContent = `Login failed: ${data.message}`;
        }
      }
      )
      .catch(error => {
        console.error('Error during API call:', error);
        responseContainer.textContent = 'Login failed due to network error.';
      }
      );
  }
}

// 学生登录按钮
const loginBtn = document.getElementById('loginBtn');
loginBtn.addEventListener('click', handleLogin(0)); // 0 for student

// 老师登录按钮
const loginBtn1 = document.getElementById('loginBtn1');
loginBtn1.addEventListener('click', handleLogin(1)); // 1 for teacher

// Admin登录按钮
const loginBtn2 = document.getElementById('loginBtn2');
loginBtn2.addEventListener('click', handleLogin(2)); // 2 for admin