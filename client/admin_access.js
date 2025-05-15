// 从 localStorage 获取用户信息
const userId = localStorage.getItem('userId');
const userName = localStorage.getItem('userName');
const role = localStorage.getItem('role');
const userInfoDiv = document.getElementById('userInfo');


// 管理员登录，显示管理员信息
userInfoDiv.textContent = `Logged in as Admin: ID ${userId}`;
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
          <p><strong>Performance Ratio:</strong> <span id="hp-${project.performanceRatio}">${project.performanceRatio}</span></p>
          <p><strong>Budget:</strong> <span id="bd-${project.projectId}">${project.budget}</span></p>
          <p><strong>Balance:</strong> <span id="hp-${project.balance}">${project.balance}</span></p>
          <p><strong>Leading Professor:</strong> ${project.leadingProfessor}</p>
          <p><strong>Participants:</strong> ${project.participants}</p>
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

            <label for="editPr-${project.projectId}">Performance ratio:</label>
            <input type="number" id="editPr-${project.projectId}" placeholder="Performance ratio" value="${project.performanceRatio}"><br>
            
            <label for="editBd-${project.projectId}">Balance:</label>
            <input type="number" id="editBd-${project.projectId}" placeholder="Balance" value="${project.balance}"><br>
            
            <label for="editPt-${project.projectId}">Participants:</label>
            <input type="text" id="editPt-${project.projectId}" placeholder="Participants" value="${project.participantIds}"><br>
            
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
    if (confirm("Are you sure to delete project " + projectId + "?")) {
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
    const newPr = document.getElementById(`editPr-${projectId}`).value;
    const newBd = document.getElementById(`editBd-${projectId}`).value;
    const newPtInput = document.getElementById(`editPt-${projectId}`).value;
    const newPt = newPtInput.split(',').map(item => item.trim());

    const numHp = Number(newHp);
    const numPr = Number(newPr);
    const numBd = Number(newBd);

    // 验证所有数字输入必须为正数
    if (numHp <= 0) {
        alert("Hour Payment must be a positive number!");
        return;
    }
    if (numPr < 0) {
        alert("Performance Ratio must be a positive number!");
        return;
    }
    if (numBd < 0) {
        alert("Balance must be non-negative!");
        return;
    }
    const participantRegex = /^\S+$/;
    for (let participant of newPt) {
        if (!participantRegex.test(participant)) {
            alert("Input error: Please input the participant IDs with seperator ','.");
            return;
        }
    }

    fetch(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            hourPayment: Number(newHp),
            balance: Number(newBd),
            performanceRatio: Number(newPr),
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
    const performanceRatio = Number(document.getElementById('newPerformanceRatio').value);
    const budget = Number(document.getElementById('newBudget').value);
    const participantsInput = document.getElementById('newParticipants').value;
    const participantsArr = participantsInput.split(',').map(item => item.trim());
    const leadingProfessor = document.getElementById('newLeadingProfessor').value;

    // 验证所有数字输入必须为正数
    if (hourPayment <= 0) {
        alert("Hour Payment must be a positive number!");
        return;
    }
    if (performanceRatio <= 0) {
        alert("Performance Ratio must be a positive number!");
        return;
    }
    if (budget <= 0) {
        alert("Budget must be a positive number!");
        return;
    }

    const participantRegex = /^\S+$/;
    for (let participant of participantsArr) {
        if (!participantRegex.test(participant)) {
            alert("Input error: Please input the participant IDs with seperator ','.");
            return;
        }
    }

    fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            projectId,
            projectName,
            description,
            hourPayment,
            performanceRatio,
            budget,
            participants: participantsArr,
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
                document.getElementById('newPerformanceRatio').value = '';
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
