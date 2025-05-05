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
          // 示例：在 fetchProjects() 中生成项目列表
          data.projects.forEach(project => {
            // 为每个项目创建一个显示区域
            const projectDiv = document.createElement('div');
            projectDiv.style.border = "1px solid #ddd";
            projectDiv.style.padding = "10px";
            projectDiv.style.marginBottom = "10px";

            // 将项目信息放到一个段落中
            const infoHTML = `
              <p><strong>Project ID:</strong> ${project.projectId}</p>
              <p><strong>Name:</strong> ${project.projectName}</p>
              <p><strong>Description:</strong> ${project.description}</p>
              <p><strong>Hour Payment:</strong> <span id="hp-${project.projectId}">${project.hourPayment}</span></p>
              <p><strong>Budget:</strong> <span id="bd-${project.projectId}">${project.budget}</span></p>
              <p><strong>Participants:</strong> <span id="pt-${project.projectId}">${project.participants.join(', ')}</span></p>
              <p><strong>Leading Professor:</strong> ${project.leadingProfessor}</p>
            `;

            // 将编辑和删除按钮放到一个单独的动作容器中
            const actionsHTML = `
              <div class="project-actions" style="margin-top:10px;">
                <button onclick="editProject('${project.projectId}')">Edit</button>
                <button onclick="deleteProject('${project.projectId}')">Delete</button>
              </div>
              <div id="edit-${project.projectId}" style="display: none; margin-top:10px;">
                <label for="editHp-${project.projectId}">Hour Payment:</label>
                <input type="number" id="editHp-${project.projectId}" placeholder="Hour Payment" value="${project.hourPayment}"><br>
                
                <label for="editBd-${project.projectId}">Budget:</label>
                <input type="number" id="editBd-${project.projectId}" placeholder="Budget" value="${project.budget}"><br>
                
                <label for="editPt-${project.projectId}">Participants:</label>
                <input type="text" id="editPt-${project.projectId}" placeholder="Participants (comma separated)" value="${project.participants.join(', ')}"><br>
                
                <button onclick="updateProject('${project.projectId}')">Update</button>
              </div>
            `;

            projectDiv.innerHTML = infoHTML + actionsHTML;
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
    const description = document.getElementById('newDescription').value;
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
        description,
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
        // 清除输入框内容
        document.getElementById('newProjectId').value = '';
        document.getElementById('newProjectName').value = '';
        document.getElementById('newDescription').value = '';
        document.getElementById('newHourPayment').value = '';
        document.getElementById('newBudget').value = '';
        document.getElementById('newParticipants').value = '';
        document.getElementById('newLeadingProfessor').value = '';
      } else {
        alert("Failed to add project: " + data.message);
      }
    })
    .catch(error => console.error("Error adding project:", error));
  });
   // 新增年度报告相关
document.getElementById('showAnnualReportBtn').addEventListener('click', () => {
  // 尝试从输入框获取年份
  const yearInput = document.getElementById('reportYear').value;
  const year = yearInput ? yearInput : new Date().getFullYear();
  
  fetch(`http://localhost:3000/api/annual-report?year=${year}`)
    .then(response => response.json())
    .then(data => {
      const reportDiv = document.getElementById('annualReport');
      if (data.success) {
        // 构造一个简单的表格显示年度报告数据
        let html = `<h3>Annual Report for ${data.year}</h3>`;
        html += `<table border="1" cellpadding="5" cellspacing="0">
                   <tr>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Total Wage</th>
                      <th>Average Score</th>
                   </tr>`;
        data.report.forEach(item => {
          html += `<tr>
                     <td>${item.studentId}</td>
                     <td>${item.studentName}</td>
                     <td>${item.totalWage}</td>
                     <td>${item.averageScore}</td>
                   </tr>`;
        });
        html += `</table>`;
        reportDiv.innerHTML = html;
      } else {
        reportDiv.textContent = "Failed to load annual report: " + data.message;
      }
    })
    .catch(error => {
      console.error("Error fetching annual report:", error);
      document.getElementById('annualReport').textContent = "Error loading annual report.";
    });
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
                <strong>Incentive Bonus:</strong> $${project.IncentiveBonus}<br>
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

    // 点击View Details按钮后，显示项目详情
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
    
    // 点击月份导航按钮时，调用该函数以更改月份
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
    
    // 在fetchProjectDetails函数中，创建MonthNav、获取当前月份后，调用loadProjectDetailsByMonth函数加载当月详情
    function loadProjectDetailsByMonth(projectId, month) {
      // 获取 performance_scores 和 working_hours 数据
      Promise.all([
        fetch(`http://localhost:3000/api/project-students/${projectId}?month=${month}`).then(res => res.json()),
        fetch(`http://localhost:3000/api/project-working-hours/${projectId}`).then(res => res.json())
      ])
        .then(([performanceData, workingHoursData]) => {
          const projectDetailsDiv = document.getElementById('projectDetails');
          const studentListDiv = document.createElement('div');
          studentListDiv.innerHTML = ''; // 清空学生列表
    
          if (performanceData.success && performanceData.students.length > 0) {
            performanceData.students.forEach(student => {
              const studentDiv = document.createElement('div');
              studentDiv.className = 'project-box'; // 添加样式类
    
              // 查找该学生的工作时长审核数据
              const workingHoursEntry = workingHoursData.workingHours.find(
                entry => entry.studentId === student.studentId && entry.uploadDate.startsWith(month)
              );
    
              // 构建工作时长审核状态的展示
              let workingHoursHTML = '';
              if (workingHoursEntry) {
                const { workingHours, approvalStatus } = workingHoursEntry;
                let statusText = '';
                let buttons = '';
    
                if (approvalStatus === 0) {
                  statusText = 'Pending Approval';
                  buttons = `
                    <button onclick="updateApprovalStatus('${projectId}', '${student.studentId}', 1)">Approve</button>
                    <button onclick="updateApprovalStatus('${projectId}', '${student.studentId}', 2)">Reject</button>
                  `;
                } else if (approvalStatus === 1) {
                  statusText = 'Approved';
                  buttons = `<button disabled style="background-color: lightgreen;">Approved</button>`;
                } else if (approvalStatus === 2) {
                  statusText = 'Rejected';
                  buttons = `<button disabled style="background-color: lightcoral;">Rejected</button>`;
                }
    
                workingHoursHTML = `
                  <strong>Working Hours:</strong> ${workingHours}<br>
                  <strong>Status:</strong> ${statusText}<br>
                  ${buttons}
                `;
              } else {
                workingHoursHTML = '<strong>Working Hours:</strong> Not Uploaded<br>';
              }
    
              // 构建学生信息和 performance score 的展示
              studentDiv.innerHTML = `
                <strong>Student ID:</strong> ${student.studentId}<br>
                <strong>Name:</strong> ${student.studentName}<br>
                <strong>Performance Score:</strong> 
                <input type="number" id="score-${student.studentId}" value="${student.performanceScore || ''}" placeholder="Enter score">
                <button onclick="updatePerformanceScore('${projectId}', '${student.studentId}', '${month}')">Update</button><br>
                ${workingHoursHTML}
              `;
    
              studentListDiv.appendChild(studentDiv);
            });
          } else {
            studentListDiv.textContent = "No students found for this project in the selected month.";
          }
    
          // 替换旧的学生列表
          const oldStudentList = projectDetailsDiv.querySelector('.student-list');
          if (oldStudentList) {
            projectDetailsDiv.removeChild(oldStudentList);
          }
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
    function updateApprovalStatus(projectId, studentId, status) {
      fetch(`http://localhost:3000/api/project-working-hours/${projectId}/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus: status })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert("Update status successfully!");
            loadProjectDetailsByMonth(projectId, document.getElementById('currentMonth').textContent);
          } else {
            // 处理错误情况：比如后端判断计算出来的wage超过了budget，则无法更新Status，同时也无法发工资
            alert("Failed to update approval status: " + data.message);
          }
        })
        .catch(error => console.error("Error updating approval status:", error));
    }

 }
 else if(role ==='student') {
    // 学生登录，显示学生信息
    adminProjects.style.display = 'none';
    studentProjects.style.display = 'block';
    teacherProjects.style.display = 'none';
    userInfoDiv.textContent = `Logged in as Student: ${userName} (ID: ${userId})`;

  // 学生使用的function:
 // 上传工作时间的函数，该函数会在点击“Upload”按钮时被调用
 function uploadWorkingHours(projectId) {
  const workingHours = document.getElementById(`workingHours-${projectId}`).value;
  const yearMonth = new Date().toISOString().slice(0, 7); // 获取当前年月，格式为 YYYY-MM

  // 通过api/upload-working-hours上传工作时间数据
  fetch('http://localhost:3000/api/upload-working-hours', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, studentId: userId, workingHours: Number(workingHours), yearMonth }) // 传入所有参数
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("Working hours uploaded successfully!");
        // 更新页面显示已提交的工作时长
        const submittedHoursDiv = document.getElementById(`submittedHours-${projectId}`);
        submittedHoursDiv.textContent = `Submitted working hours for ${yearMonth}: ${workingHours}`;
      } else {
        alert("Failed to upload working hours: " + data.message);
      }
    })
    .catch(error => console.error("Error uploading working hours:", error));
}

// 获取学生项目数据并显示在页面上
function fetchStudentProjects() {
  // 通过api/student-projects获取学生项目数据
  fetch('http://localhost:3000/api/student-projects')
      .then(response => response.json()) // 解析JSON响应
      .then(data => { // data是解析后的JSON对象
          const studentProjectList = document.getElementById('studentProjectList');// 子容器
          studentProjectList.innerHTML = ''; // 清空子容器
          if (data.success && data.projects.length > 0) {

            // 通过api/student-working-hours/${userId}获取学生已提交的工作时长
            fetch(`http://localhost:3000/api/student-working-hours/${userId}`)
            .then(response => response.json())
            .then(hoursData => {
              const submittedHours = hoursData.success ? hoursData.workingHours : [];

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
                      <strong>Hourly Payment:</strong> $${project.hourPayment}<br>
                      <strong>Start Date:</strong> ${project.startDate}<br>
                  `;

                  // 查找该项目的已提交工作时长 不管老师是否审核
                  const projectHours = submittedHours.find(entry => entry.projectId === project.projectId);
                  const submittedHoursText = projectHours
                    ? `Submitted working hours for ${projectHours.uploadDate}: ${projectHours.workingHours}`
                    : 'No hours submitted yet.';

                  // 创建用于显示已提交的工作时长的容器
                  const submittedHoursDiv = document.createElement('div');
                  submittedHoursDiv.id = `submittedHours-${project.projectId}`;
                  submittedHoursDiv.style.marginTop = '10px';
                  submittedHoursDiv.textContent = submittedHoursText; // 动态设置内容

                  // 添加 Upload Working Hours 按钮
                  const uploadButton = document.createElement('button');
                  uploadButton.textContent = 'Upload Working Hours';
                  uploadButton.style.marginTop = '10px';

                  // 创建用于显示上传工作时间的容器
                  const uploadDiv = document.createElement('div');
                  uploadDiv.style.display = 'none'; // 初始隐藏
                  uploadDiv.innerHTML = `
                      <p><strong>Time:</strong> ${new Date().toISOString().slice(0, 7)}</p>
                      <p>Please upload your working hours this month.</p>
                      <p>The submitted working hours will first be verified by the teacher.</p>
                      <input type="number" id="workingHours-${project.projectId}" placeholder="Enter working hours" style="margin-bottom: 10px;">
                      <button onclick="uploadWorkingHours('${project.projectId}')">Upload</button>
                  `;
                  
                  uploadButton.addEventListener('click', () => {
                      // 切换显示/隐藏状态
                      uploadDiv.style.display = uploadDiv.style.display === 'none' ? 'block' : 'none';
                  });

                  // 添加 Wage History 按钮
                  const wageHistoryButton = document.createElement('button');
                  wageHistoryButton.textContent = 'Wage History';
                  wageHistoryButton.style.marginLeft = '10px';

                  wageHistoryButton.addEventListener('click', () => {
                    const wageHistoryList = document.getElementById('wageHistoryList');
                    if (wageHistoryList.style.display === 'none' || wageHistoryList.dataset.projectId !== project.projectId) {
                        // 显示工资历史并加载数据
                        wageHistoryList.style.display = 'block';
                        wageHistoryList.dataset.projectId = project.projectId; // 记录当前项目 ID
                        //call fetchWageHistory function to fetch and display wage history
                        fetchWageHistory(project.projectId);
                    } else {
                        // 隐藏工资历史
                        wageHistoryList.style.display = 'none';
                        wageHistoryList.dataset.projectId = ''; // 清空项目 ID
                    }
                });
              

                  // 确保按钮一直在upload working hour详情部分的上方
                  projectDiv.appendChild(uploadButton);
                  projectDiv.appendChild(wageHistoryButton);

                  projectDiv.appendChild(uploadDiv);
                  projectDiv.appendChild(submittedHoursDiv);
                  studentProjectList.appendChild(projectDiv);
              });
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
              <strong>Approved Working Hours:</strong> ${entry.workingHours || 'N/A'}<br>
              <strong>Performance Score:</strong> ${entry.performanceScore}<br>
              <strong>Wage:</strong> $${entry.wage}<br>
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
