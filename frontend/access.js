 // 从 localStorage 获取用户信息
 const userId = localStorage.getItem('userId');
 const userName = localStorage.getItem('userName');
 const role = localStorage.getItem('role');

// 获取各个身份的内容容器
const adminProjects = document.getElementById('adminProjects');
const studentProjects = document.getElementById('studentProjects');
const teacherProjects = document.getElementById('teacherProjects');

 const userInfoDiv = document.getElementById('userInfo');
 
 
 if(role === 'admin') {
    adminProjects.style.display = 'block';
    studentProjects.style.display = 'none';
    teacherProjects.style.display = 'none';
    // 管理员登录，显示管理员信息
    userInfoDiv.textContent = `Logged in as Admin: ${userName} (ID: ${userId})`;
    // 获取项目数据，并显示到页面中
function fetchProjects() {
    fetch('http://localhost:3000/api/projects')
      .then(response => response.json())
      .then(data => {
        const projectsDiv = document.getElementById('projects');
        projectsDiv.innerHTML = '';
        if (data.success && data.projects.length > 0) {
          data.projects.forEach(project => {
            // 为每个项目创建一个显示区域
            const projectDiv = document.createElement('div');
            projectDiv.style.border = "1px solid #ddd";
            projectDiv.style.padding = "10px";
            projectDiv.style.marginBottom = "10px";
            
            // 显示项目信息
            projectDiv.innerHTML = `
              <strong>Project ID:</strong> ${project.projectId}<br>
              <strong>Name:</strong> ${project.projectName}<br>
              <strong>Hour Payment:</strong> <span id="hp-${project.projectId}">${project.hourPayment}</span><br>
              <strong>Budget:</strong> <span id="bd-${project.projectId}">${project.budget}</span><br>
              <strong>Participants:</strong> <span id="pt-${project.projectId}">${project.participants.join(', ')}</span><br>
              <strong>Leading Professor:</strong> ${project.leadingProfessor}<br>
              <button onclick="editProject('${project.projectId}')">Edit</button>
              <div id="edit-${project.projectId}" style="display: none;">
                <input type="number" id="editHp-${project.projectId}" placeholder="Hour Payment" value="${project.hourPayment}"><br>
                <input type="number" id="editBd-${project.projectId}" placeholder="Budget" value="${project.budget}"><br>
                <input type="text" id="editPt-${project.projectId}" placeholder="Participants (comma separated)" value="${project.participants.join(', ')}"><br>
                <button onclick="updateProject('${project.projectId}')">Update</button>
                <button onclick="deleteProject('${project.projectId}')">Delete</button>
                <div id="edit-${project.projectId}" style="display: none;">
              </div>
            `;
            projectsDiv.appendChild(projectDiv);
          });
        } else {
          projectsDiv.textContent = "No projects found.";
        }
      })
      .catch(error => console.error("Error fetching projects:", error));
  }
    // 新增 deleteProject() 函数
function deleteProject(projectId) {
  if(confirm("Are you sure to delete project " + projectId + "?")){
    fetch(`http://localhost:3000/api/projects/${projectId}`, {
      method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("Project deleted successfully!");
        fetchProjects();
      } else {
        alert("Deletion failed: " + data.message);
      }
    })
    .catch(error => console.error("Error deleting project:", error));
  }
}
  
  // 点击编辑，显示编辑表单
  function editProject(projectId) {
    const editDiv = document.getElementById(`edit-${projectId}`);
    editDiv.style.display = editDiv.style.display === 'none' ? 'block' : 'none';
  }
  
  // 更新项目
  function updateProject(projectId) {
    const newHp = document.getElementById(`editHp-${projectId}`).value;
    const newBd = document.getElementById(`editBd-${projectId}`).value;
    const newPt = document.getElementById(`editPt-${projectId}`).value.split(',').map(item => item.trim());
    
    fetch(`http://localhost:3000/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hourPayment: Number(newHp),
        budget: Number(newBd),
        participants: newPt
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("Project updated successfully!");
        fetchProjects();
      } else {
        alert("Update failed: " + data.message);
      }
    })
    .catch(error => console.error("Error updating project:", error));
  }
  
  // 添加新项目
  document.getElementById('addProjectBtn').addEventListener('click', () => {
    const projectId = document.getElementById('newProjectId').value;
    const projectName = document.getElementById('newProjectName').value;
    const hourPayment = Number(document.getElementById('newHourPayment').value);
    const budget = Number(document.getElementById('newBudget').value);
    const participants = document.getElementById('newParticipants').value.split(',').map(item => item.trim());
    const leadingProfessor = document.getElementById('newLeadingProfessor').value;
    
    fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        projectName,
        hourPayment,
        budget,
        participants,
        leadingProfessor
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("New project added!");
        fetchProjects();
      } else {
        alert("Failed to add project: " + data.message);
      }
    })
    .catch(error => console.error("Error adding project:", error));
  });

  
  // 初始化加载项目数据
  fetchProjects();
     }
 else if(role === 'teacher') {
    adminProjects.style.display = 'none';
    studentProjects.style.display = 'none';
    teacherProjects.style.display = 'block';
    // 教师登录，显示教师信息
    userInfoDiv.textContent = `Logged in as Teacher: ${userName} (ID: ${userId})`;

    function fetchTeacherProjects() {
      // 通过api/teacher-projects获取教师项目数据
      fetch('http://localhost:3000/api/teacher-projects')
        .then(response => response.json())
        .then(data => {
          const teacherProjectList = document.getElementById('teacherProjectList'); // 容器
          teacherProjectList.innerHTML = ''; // 清空内容
    
          if (data.success && data.projects.length > 0) {
            data.projects.forEach(project => {
              const projectDiv = document.createElement('div');
              projectDiv.className = 'project-box'; // 添加样式类
    
              projectDiv.innerHTML = `
                <strong>Project ID:</strong> ${project.projectId}<br>
                <strong>Name:</strong> ${project.projectName}<br>
                <strong>Budget:</strong> $${project.budget}<br>
                <strong>Participants:</strong> ${project.participants.join(', ')}<br>
                <button class=".button" onclick="fetchProjectDetails('${project.projectId}')">View Details</button>
              `;
    
              teacherProjectList.appendChild(projectDiv);
            });
          } else {
            teacherProjectList.textContent = "No projects found.";
          }
        })
        .catch(error => console.error("Error fetching teacher projects:", error));
    }
    // 调用函数以获取教师项目数据并显示在页面上
    fetchTeacherProjects();

    function fetchProjectDetails(projectId) {
      let currentMonth = new Date().toISOString().slice(0, 7); // 获取当前月份（格式：YYYY-MM）
    
      const projectDetailsDiv = document.getElementById('projectDetails');
      projectDetailsDiv.innerHTML = ''; // 清空内容
    
      // 创建月份导航monthNav
      const monthNav = document.createElement('div');
      monthNav.style.marginBottom = '10px';
      monthNav.innerHTML = `
        <button onclick="changeMonth('${projectId}', -1)">Previous Month</button>
        <span id="currentMonth">${currentMonth}</span>
        <button onclick="changeMonth('${projectId}', 1)">Next Month</button>
      `;
      projectDetailsDiv.appendChild(monthNav);
    
      // 加载当前月份的数据
      loadProjectDetailsByMonth(projectId, currentMonth);
    }
    
    function changeMonth(projectId, offset) {
      const currentMonthSpan = document.getElementById('currentMonth');
      let currentMonth = currentMonthSpan.textContent;
    
      // 计算新的月份
      const date = new Date(currentMonth + '-01');
      date.setMonth(date.getMonth() + offset);
      const newMonth = date.toISOString().slice(0, 7);
    
      // 更新月份显示
      currentMonthSpan.textContent = newMonth;
    
      // 加载新的月份数据
      loadProjectDetailsByMonth(projectId, newMonth);
    }
    
    function loadProjectDetailsByMonth(projectId, month) {
      // 通过api/project-students/${projectId}?month=${month}获取项目学生数据
      fetch(`http://localhost:3000/api/project-students/${projectId}?month=${month}`)
        .then(response => response.json())
        .then(data => {
          const projectDetailsDiv = document.getElementById('projectDetails');
          const studentListDiv = document.createElement('div');
          studentListDiv.innerHTML = ''; // 清空学生列表
    
          if (data.success && data.students.length > 0) {
            data.students.forEach(student => {
              const studentDiv = document.createElement('div');
              studentDiv.className = 'project-box'; // 添加样式类，已在style.css中定义
    
              studentDiv.innerHTML = `
                <strong>Student ID:</strong> ${student.studentId}<br>
                <strong>Name:</strong> ${student.studentName}<br>
                <strong>Performance Score:</strong> 
                <input type="number" id="score-${student.studentId}" value="${student.performanceScore || ''}" placeholder="Enter score">
                <button onclick="updatePerformanceScore('${projectId}', '${student.studentId}', '${month}')">Update</button>
              `;
    
              studentListDiv.appendChild(studentDiv);
            });
          } else {
            studentListDiv.textContent = "You cannot give the student performance score in this month.";
          }
    
          // 替换旧的学生列表
          const oldStudentList = projectDetailsDiv.querySelector('.student-list');
          // 如果存在旧的学生列表，则移除它
          if (oldStudentList) {
            projectDetailsDiv.removeChild(oldStudentList);
          }
          // 添加新的学生列表，确保页面显示的是最新的内容
          studentListDiv.className = 'student-list';
          projectDetailsDiv.appendChild(studentListDiv);
        })
        .catch(error => console.error("Error fetching project details:", error));
    }
    
    function updatePerformanceScore(projectId, studentId, month) {
      const scoreInput = document.getElementById(`score-${studentId}`);
      const newScore = Number(scoreInput.value);
    
      // 通过api/project-students/${projectId}/${studentId}更新学生的performance score
      fetch(`http://localhost:3000/api/project-students/${projectId}/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performanceScore: newScore, date: month })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert("Performance score updated successfully!");
          } else {
            alert("Failed to update performance score: " + data.message);
          }
        })
        .catch(error => console.error("Error updating performance score:", error));
    }
 }
 else if(role ==='student') {
    // 学生登录，显示学生信息
    adminProjects.style.display = 'none';
    studentProjects.style.display = 'block';
    teacherProjects.style.display = 'none';
    userInfoDiv.textContent = `Logged in as Student: ${userName} (ID: ${userId})`;

  // 学生使用的function:
// 获取学生项目数据并显示在页面上
function fetchStudentProjects() {
  // 通过api/student-projects获取学生项目数据
  fetch('http://localhost:3000/api/student-projects')
      .then(response => response.json()) // 解析JSON响应
      .then(data => { // data是解析后的JSON对象
          const studentProjectList = document.getElementById('studentProjectList');// 子容器
          studentProjectList.innerHTML = ''; // 清空子容器
          if (data.success && data.projects.length > 0) {
            // 使用data.projects来访问项目数据
              // 遍历每个项目数据并创建HTML元素显示在页面上
              data.projects.forEach(project => {
                  const projectDiv = document.createElement('div'); // projectDiv是一个新的div元素，用于显示项目
                  projectDiv.className = 'project-box'; // 添加样式类，已在style.css中定义

                  projectDiv.innerHTML = `
                      <strong>Project ID:</strong> ${project.projectId}<br>
                      <strong>Name:</strong> ${project.projectName}<br>
                      <strong>Leading Professor:</strong> ${project.leadingProfessor}<br>
                      <strong>Description:</strong> ${project.description}<br>
                      <strong>Start Date:</strong> ${project.startDate}<br>
                  `;

                  // 点击事件，显示对应项目的 Wage History
                  projectDiv.addEventListener('click', () => {
                    // 获得的结果project.projectId作为参数传入方程，同时也作为api/student-wage-history/${projectId}的参数
                    fetchWageHistory(project.projectId);
                  });

                  studentProjectList.appendChild(projectDiv);
              });
          } else {
              studentProjectList.textContent = "No projects found.";
          }
      })
      .catch(error => console.error("Error fetching student projects:", error));
    }
 fetchStudentProjects();

 // 获取并显示 Wage History
  function fetchWageHistory(projectId) {
    const wageHistoryList = document.getElementById('wageHistoryList'); // Wage History 容器
    wageHistoryList.innerHTML = '<p>Loading wage history...</p>'; // 显示加载提示

    // 通过api/student-wage-history/${projectId}获取学生项目的Wage History数据
    fetch(`http://localhost:3000/api/student-wage-history/${projectId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.history.length > 0) {
          wageHistoryList.innerHTML = ''; // 清空 Wage History 容器

          // 添加项目 ID 和名称的标题（在展示该project的wage history之前）
          const projectHeader = document.createElement('div');
          projectHeader.className = 'project-header'; // 添加样式类，已在style.css中定义

          projectHeader.innerHTML = `
            <strong>Project ID:</strong> ${data.history[0].projectId} &nbsp;&nbsp;
            <strong>Project Name:</strong> ${data.history[0].projectName}
          `;
          wageHistoryList.appendChild(projectHeader);

          //遍历wage history数据并创建HTML元素显示在页面上
          data.history.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'project-box'; // 添加样式类，已在style.css中定义

            entryDiv.innerHTML = `
              <strong>Date:</strong> ${entry.date}<br>
              <strong>Project ID:</strong> ${entry.projectId}<br>
              <strong>Project Name:</strong> ${entry.projectName}<br>
              <strong>Wage:</strong> $${entry.wage}<br>
              <strong>Performance Score:</strong> ${entry.performanceScore}<br>
            `;
            wageHistoryList.appendChild(entryDiv);
          });
        } else {
          wageHistoryList.innerHTML = '<p>No wage history found for this project.</p>';
        }
      })
      .catch(error => {
        console.error("Error fetching wage history:", error);
        wageHistoryList.innerHTML = '<p>Error loading wage history.</p>';
      });
 }
}
