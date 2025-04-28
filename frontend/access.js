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
  fetch('http://localhost:3000/api/student-projects')
      .then(response => response.json())
      .then(data => {
          const studentProjectsDiv = document.getElementById('studentProjects');
          studentProjectsDiv.innerHTML = '';
          if (data.success && data.projects.length > 0) {
              data.projects.forEach(project => {
                  const projectDiv = document.createElement('div');
                  projectDiv.style.border = "1px solid #ddd";
                  projectDiv.style.padding = "10px";
                  projectDiv.style.marginBottom = "10px";

                  projectDiv.innerHTML = `
                      <strong>Project ID:</strong> ${project.projectId}<br>
                      <strong>Name:</strong> ${project.projectName}<br>
                      <strong>Leading Professor:</strong> ${project.leadingProfessor}<br>
                      <strong>Description:</strong> ${project.description}<br>
                      <strong>Start Date:</strong> ${project.startDate}<br>
                  `;
                  studentProjectsDiv.appendChild(projectDiv);
              });
          } else {
              studentProjectsDiv.textContent = "No projects found.";
          }
      })
      .catch(error => console.error("Error fetching student projects:", error));
    }
 fetchStudentProjects();
 }
 // 调用项目API获取数据
 
