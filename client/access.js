// 从 localStorage 获取用户信息
const userId = localStorage.getItem('userId');
const userName = localStorage.getItem('userName');
const role = localStorage.getItem('role');

// 获取各个身份的内容容器
const adminProjects = document.getElementById('adminProjects');
const studentProjects = document.getElementById('studentProjects');
const teacherProjects = document.getElementById('teacherProjects');

const userInfoDiv = document.getElementById('userInfo');

adminProjects.style.display = 'none';
studentProjects.style.display = 'none';
teacherProjects.style.display = 'none';


if (role == 2) {
  adminProjects.style.display = 'block';
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
}
else if (role == 1) {
  teacherProjects.style.display = 'block';
  // 教师登录，显示教师信息
  userInfoDiv.textContent = `Logged in as Teacher: ${userName} (ID: ${userId})`;

  function fetchTeacherProjects() {
    // 获取教师ID从localStorage
    const teacherId = localStorage.getItem('userId');
    // 通过api/teacher-projects传入teacherId获取对应的教师项目数据
    fetch(`http://localhost:3000/api/teacher-projects/${teacherId}`)
      .then(response => response.json())
      .then(data => {
        const teacherProjectList = document.getElementById('teacherProjectList');
        teacherProjectList.innerHTML = ''; // 清空内容

        if (data.success && data.projects.length > 0) {
          data.projects.forEach(project => {
            const projectDiv = document.createElement('div');
            projectDiv.className = 'project-box'; // 添加样式类

            projectDiv.innerHTML = `
                <strong>Project ID:</strong> ${project.projectId}<br>
                <strong>Name:</strong> ${project.projectName}<br>
                <strong>Budget:</strong> $${project.budget}<br>
                <strong>Participants:</strong> ${project.participants}<br>
                <button class="button" onclick="fetchProjectDetails('${project.projectId}')">View Details</button>
                <button class=".button" style="margin-left: 10px;" onclick="fetchWagePaymentSituation('${project.projectId}')">Wage payment</button>
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

  // 创建日期导航区域，返回包含年份、月份选择与确认按钮的 DOM 节点
  function createDateNavigation(currentYear, currentMonth) {
    const dateNav = document.createElement('div');
    dateNav.style.marginBottom = '10px';
    dateNav.innerHTML = `
      <label for="yearSelect">Year:</label>
      <select id="yearSelect">
          ${[...Array(5)]
        .map((_, i) => {
          const year = currentYear - i;
          return `<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`;
        })
        .join('')}
      </select>
      <label for="monthSelect">Month:</label>
      <select id="monthSelect">
          ${[...Array(12)]
        .map((_, i) => {
          const month = (i + 1).toString().padStart(2, '0');
          return `<option value="${month}" ${month === currentMonth ? 'selected' : ''}>${month}</option>`;
        })
        .join('')}
      </select>
      <button class="button" id="confirmButton1" style="margin-left: 10px;">Confirm</button>
    `;
    return dateNav;
  }

  // 根据学生数组构建结果区域
  function renderStudentDetails(students, projectId, resultDiv) {
    resultDiv.innerHTML = ''; // 清空之前的内容
    if (students.length === 0) {
      resultDiv.textContent = 'No records found for the selected criteria.';
      return;
    }
    students.forEach(student => {
      const entryDiv = document.createElement('div');
      // const date = new Date(student.uploadDate).toDateString();
      const date = student.uploadDate;
      entryDiv.className = 'project-box';
      entryDiv.innerHTML = `
      <strong>Student ID:</strong> ${student.studentId}<br>
      <strong>Student Name:</strong> ${student.studentName}<br>
      <strong>Working Hours:</strong> ${student.workingHours !== null ? student.workingHours : 'Not Uploaded'}<br>
      <strong>Upload Date:</strong> ${date}<br>
      <strong>Approval Status:</strong> ${student.approvalStatus}<br>
      <div id="editDiv-${student.studentId}" style="margin-top: 10px;">
      <label for="performanceScore-${student.studentId}">Performance Score:</label>
      <input type="number" id="performanceScore-${student.studentId}" value="${student.performanceScore || ''}" min="0" placeholder="Enter score"><br>
      </div>
      <button class="button" id="approve-${student.studentId}">Approve</button>
      <button class="button" id="reject-${student.studentId}" style="margin-left: 10px;">Reject</button>
        `;
      resultDiv.appendChild(entryDiv);
      // Approve button listener
      document.getElementById(`approve-${student.studentId}`).addEventListener('click', () => {
        const performanceScore = document.getElementById(`performanceScore-${student.studentId}`).value;
        if (performanceScore === '' || performanceScore < 0 || isNaN(performanceScore)) {
          alert('Performance Score must be a non-negative number.');
          return;
        }

        fetch(`http://localhost:3000/api/project-students/approve`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            studentId: student.studentId,
            date,
            performanceScore: Number(performanceScore)
          })
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              alert('Student approved successfully!');
              document.getElementById('confirmButton1').click(); // Refresh the data
            } else {
              alert('Failed to approve student: ' + data.message);
            }
          })
          .catch(error => console.error('Error approving student:', error));
      });

      // Reject button listener
      document.getElementById(`reject-${student.studentId}`).addEventListener('click', () => {
        fetch(`http://localhost:3000/api/project-students/reject`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            studentId: student.studentId,
            date
          })
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              alert('Student rejected successfully!');
              document.getElementById('confirmButton1').click(); // Refresh the data
            } else {
              alert('Failed to reject student: ' + data.message);
            }
          })
          .catch(error => console.error('Error rejecting student:', error));
      });
    });
  }

  // 给确认按钮添加点击事件，校验选择并获取学生数据
  function attachConfirmHandler(projectId, currentYear, currentMonth, resultDiv) {
    const confirmButton = document.getElementById('confirmButton1');
    confirmButton.addEventListener('click', () => {
      const selectedYear = parseInt(document.getElementById('yearSelect').value, 10);
      const selectedMonth = parseInt(document.getElementById('monthSelect').value, 10);

      // 校验不能选择未来日期
      if (selectedYear > currentYear || (selectedYear === currentYear && selectedMonth > currentMonth)) {
        alert('Error: You cannot select a future date.');
        return;
      }

      const month = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

      // 调用后端 API 获取对应年月的学生详情
      fetch(`http://localhost:3000/api/project-students/${projectId}?month=${month}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log(data.students);
            renderStudentDetails(data.students, projectId, resultDiv);
          } else {
            alert('Failed to fetch data: ' + data.message);
          }
        })
        .catch(error => console.error('Error fetching project student details:', error));
    });
  }

  const displayMgr = {
    DISPLAY_STATUS: ['none', 'block'],
    detailsStatus: 0,
    wageStatus: 1,
    last_id: null,
    toggleDetails: function (id) {
      if (this.last_id !== id) {
        this.last_id = id;
        this.detailsStatus = 1;
      } else {
        this.detailsStatus = 1 - this.detailsStatus;
      }
      this.wageStatus = 0; // 隐藏工资支付区域
      this.resetDisplay();
    },
    toggleWage: function (id) {
      if (this.last_id !== id) {
        this.last_id = id;
        this.wageStatus = 1;
      } else {
        this.wageStatus = 1 - this.wageStatus;
      }
      this.detailsStatus = 0; // 隐藏项目详情区域
      this.resetDisplay();
    },
    resetDisplay: function () {
      document.getElementById('WagePaymentDetails').style.display = this.DISPLAY_STATUS[this.wageStatus];
      document.getElementById('projectDetails').style.display = this.DISPLAY_STATUS[this.detailsStatus];
    }
  };

  // 主入口函数，构建整体页面结构并初始化事件绑定
  function fetchProjectDetails(projectId) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const projectDetailsDiv = document.getElementById('projectDetails');
    displayMgr.toggleDetails(projectId); // 切换项目详情区域的显示状态
    projectDetailsDiv.innerHTML = `
    <h1>Project Participant Details</h1>
    <p>Here are Project ${projectId} participant details:</p>
    `; // 清空原有内容

    // 创建并添加日期导航模块
    const dateNav = createDateNavigation(currentYear, currentMonth);
    projectDetailsDiv.appendChild(dateNav);

    // 添加显示结果的占位符
    const resultDiv = document.createElement('div');
    resultDiv.id = 'resultDiv';
    projectDetailsDiv.appendChild(resultDiv);

    // 给确认按钮绑定处理函数
    attachConfirmHandler(projectId, currentYear, currentMonth, resultDiv);
  }

  function payWage(studentId, projectId, date) {
    console.log(studentId, projectId, date);
    fetch(`http://localhost:3000/api/wage-paid`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        studentId,
        date
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Wage paid successfully!');
          document.getElementById('confirmButton1').click(); // Refresh the data
        } else {
          alert('Failed to pay wage: ' + data.message);
        }
      })
      .catch(error => console.error('Error paying wage:', error));
  }

  function renderWagePaymentDetails(wagehistory, projectId, resultDiv) {
    resultDiv.innerHTML = ''; // 清空之前的内容
    if (wagehistory.length === 0) {
      resultDiv.textContent = 'No records found for the selected criteria.';
      return;
    }
    wagehistory.forEach(wage => {
      const entryDiv = document.createElement('div');
      // const date = new Date(wage.declarationDate).toISOString().slice(0, 10);
      const date = wage.ApprovedDate;
      entryDiv.className = 'project-box';
      entryDiv.innerHTML = `
      <strong>Student ID:</strong> ${wage.studentId}<br>
      <strong>Declared Hours:</strong> ${wage.declaredHours}<br>
      <strong>Performance Score:</strong> ${wage.performanceScore}<br>
      <strong>Wage Amount:</strong> $${wage.wageAmount}<br>
      <strong>Status:</strong> ${wage.wageStatus}<br>
      <button class="button" id="${wage.wageStatus === 'APPROVED' ? `pay-${wage.studentId}` : `paid-${wage.studentId}`}" 
        ${wage.wageStatus === 'APPROVED' ? `onclick="payWage('${wage.studentId}', '${projectId}', '${date}')">Pay` : `style="background-color: gray; cursor: not-allowed;" disabled>Paid`}
      </button>
        `;
      // If status is 'APPROVED', button is "Pay"; if 'PAID', button is "Paid" and disabled.
      resultDiv.appendChild(entryDiv);
    });
  }

  function attachConfirmHandler_wage(projectId, currentYear, currentMonth, resultDiv) {
    const confirmButton = document.getElementById('confirmButton1');
    confirmButton.addEventListener('click', () => {
      const selectedYear = parseInt(document.getElementById('yearSelect').value, 10);
      const selectedMonth = parseInt(document.getElementById('monthSelect').value, 10);
      // 校验不能选择未来日期
      if (selectedYear > currentYear || (selectedYear === currentYear && selectedMonth > currentMonth)) {
        alert('Error: You cannot select a future date.');
        return;
      }

      const month = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

      console.log(month);
      // 调用后端 API 获取对应年月的工资支付情况
      fetch(`http://localhost:3000/api/wage-paid-condition/${projectId}?yearMonth=${month}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log(data.wages);
            renderWagePaymentDetails(data.wages, projectId, resultDiv);
          } else {
            alert('Failed to fetch data: ' + data.message);
          }
        })
        .catch(error => console.error('Error fetching wage payment details:', error));
    });
  }

  // 点击Wage payment按钮后，显示工资支付情况
  function fetchWagePaymentSituation(projectId) {
    let currentYear = new Date().getFullYear(); // 获取当前年份
    let currentMonth = new Date().getMonth() + 1; // 获取当前月份（格式：YYYY-MM）
    const WagePaymentDetailsDiv = document.getElementById('WagePaymentDetails');
    displayMgr.toggleWage(projectId); // 切换工资支付区域的显示状态
    WagePaymentDetailsDiv.innerHTML = `
    <h1>Wage Payment</h1>
    <p>Here are Project ${projectId} wage payment situation:</p>
    `;

    // 创建并添加日期导航模块
    const dateNav = createDateNavigation(currentYear, currentMonth);
    WagePaymentDetailsDiv.appendChild(dateNav);

    // 添加显示结果的占位符
    const resultDiv = document.createElement('div');
    resultDiv.id = 'resultDiv';
    WagePaymentDetailsDiv.appendChild(resultDiv);

    attachConfirmHandler_wage(projectId, currentYear, currentMonth, resultDiv);
  }

}
else if (role == 0) {
  studentProjects.style.display = 'block';
  // 学生登录，显示学生信息
  userInfoDiv.textContent = `Logged in as Student: ${userName} (ID: ${userId})`;
  // ...existing code...

  // 学生使用的function:
  // 申报工作时长的函数
  function declareWorkingHours(projectId) {
    const workingHours = document.getElementById(`declareHours-${projectId}`).value;
    const yearMonth = new Date().toISOString().slice(0, 7); // 获取当前年月，格式为 YYYY-MM

    fetch('http://localhost:3000/api/declare-working-hours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, studentId: userId, workingHours: Number(workingHours), yearMonth })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert("Working hours declared successfully!");
          fetchStudentProjects(); // 刷新项目列表
        } else {
          alert("Failed to declare working hours: " + data.message);
        }
      })
      .catch(error => console.error("Error declaring working hours:", error));
  }

  // 取消申报工作时长的函数
  function cancelWorkingHours(projectId) {
    fetch(`http://localhost:3000/api/cancel-working-hours/${projectId}/${userId}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert("Working hours declaration canceled successfully!");
          fetchStudentProjects(); // 刷新项目列表
        } else {
          alert("Failed to cancel working hours: " + data.message);
        }
      })
      .catch(error => console.error("Error canceling working hours:", error));
  }

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
    // 获取学生ID从localStorage
    const studentId = localStorage.getItem('userId');

    // 通过api/student-projects传入studentId获取对应的学生项目数据
    fetch(`http://localhost:3000/api/student-projects/${studentId}`)
      .then(response => response.json())
      .then(data => {
        const studentProjectList = document.getElementById('studentProjectList');
        studentProjectList.innerHTML = '';
        if (data.success && data.projects.length > 0) {
          fetch(`http://localhost:3000/api/student-working-hours/${studentId}`)
            .then(response => response.json())
            .then(hoursData => {
              const submittedHours = hoursData.success ? hoursData.workingHours : [];

              data.projects.forEach(project => {
                const projectDiv = document.createElement('div');
                projectDiv.className = 'project-box';
                projectDiv.innerHTML = `
              <strong>Project ID:</strong> ${project.projectId}<br>
              <strong>Name:</strong> ${project.projectName}<br>
              <strong>Leading Professor:</strong> ${project.leadingProfessor}<br>
              <strong>Description:</strong> ${project.description}<br>
              <strong>Hourly Payment:</strong> $${project.hourPayment}<br>
              <strong>Start Date:</strong> ${project.startDate}<br>
            `;

                const uploadedHoursButton = document.createElement('button');
                uploadedHoursButton.textContent = 'Uploaded Working Hours';
                uploadedHoursButton.style.marginTop = '10px';

                const uploadedHoursDiv = document.createElement('div');
                uploadedHoursDiv.id = `Uploadedwh-${project.projectId}`;
                uploadedHoursDiv.style.display = 'none';
                uploadedHoursDiv.style.marginTop = '10px';

                uploadedHoursButton.addEventListener('click', () => {
                  uploadedHoursDiv.style.display = uploadedHoursDiv.style.display === 'none' ? 'block' : 'none';

                  if (uploadedHoursDiv.style.display === 'block') {
                    const yearMonth = new Date().toISOString().slice(0, 7); // 获取当前年月，格式为 YYYY-MM

                    // 调用 API 获取本月最新的工作时长记录
                    fetch(`http://localhost:3000/api/student-working-hours/${studentId}?yearMonth=${yearMonth}`)
                      .then(response => response.json())
                      .then(data => {
                        if (data.success && data.workingHours.length > 0) {
                          // 找到最新的记录
                          const latestRecord = data.workingHours.reduce((latest, current) => {
                            return new Date(current.uploadDate) > new Date(latest.uploadDate) ? current : latest;
                          });

                          // 显示最新记录模块
                          uploadedHoursDiv.innerHTML = `
          <div style="margin-bottom: 20px;">
            <h4>Your last submission in this month:</h4>
            <p><strong>Submitted Time:</strong> ${latestRecord.uploadDate}</p>
            <p><strong>Uploaded Working Hour:</strong> ${latestRecord.workingHours} hour(s)</p>
            <p><strong>Status:</strong> ${latestRecord.approvalStatus === 0
                              ? 'Pending'
                              : latestRecord.approvalStatus === 1
                                ? 'Approved'
                                : 'Rejected'
                            }</p>
            <button id="editButton-${project.projectId}" style="margin-top: 10px;" ${latestRecord.approvalStatus === 0 ? 'disabled style="background-color: gray;"' : ''
                            }>Edit</button>
            <div id="editDiv-${project.projectId}" style="display: none; margin-top: 10px;">
              <label for="newWorkingHours-${project.projectId}">Upload Working Hours:</label>
              <input type="number" id="newWorkingHours-${project.projectId}" placeholder="Enter new working hours" style="margin-left: 10px;">
              <button id="updateButton-${project.projectId}" style="margin-top: 10px;">Update</button>
            </div>
          </div>
        `;

                          // 添加 Edit 按钮的事件监听器
                          const editButton = document.getElementById(`editButton-${project.projectId}`);
                          if (editButton) {
                            editButton.addEventListener('click', () => {
                              const editDiv = document.getElementById(`editDiv-${project.projectId}`);
                              editDiv.style.display = editDiv.style.display === 'none' ? 'block' : 'none';
                            });
                          }

                          // 添加 Update 按钮的事件监听器
                          const updateButton = document.getElementById(`updateButton-${project.projectId}`);
                          if (updateButton) {
                            updateButton.addEventListener('click', () => {
                              const newWorkingHours = document.getElementById(`newWorkingHours-${project.projectId}`).value;
                              if (!newWorkingHours || isNaN(newWorkingHours) || newWorkingHours <= 0) {
                                alert('Please enter a valid number of working hours.');
                                return;
                              }

                              const newUploadDate = new Date().toISOString().slice(0, 10); // 获取当前日期，格式为 YYYY-MM-DD

                              // 调用 API 上传新的工作时长
                              fetch('http://localhost:3000/api/upload-working-hours', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  projectId: project.projectId,
                                  studentId: studentId,
                                  workingHours: Number(newWorkingHours),
                                  yearMonth: newUploadDate
                                })
                              })
                                .then(response => response.json())
                                .then(data => {
                                  if (data.success) {
                                    alert('Working hours updated successfully!');
                                    uploadedHoursDiv.style.display = 'none'; // 隐藏编辑模块
                                  } else {
                                    alert('Failed to update working hours: ' + data.message);
                                  }
                                })
                                .catch(error => console.error('Error updating working hours:', error));
                            });
                          }
                        } else {
                          uploadedHoursDiv.innerHTML = `
          <div style="margin-bottom: 20px;">
            <h4>Your last submission in this month:</h4>
            <p>No working hours submitted for this month.</p>
          </div>
        `;
                        }

                        // 添加时间导航模块
                        uploadedHoursDiv.innerHTML += `
        <div>
          <h4>View your uploaded history:</h4>
          <label for="yearSelect-${project.projectId}">Year:</label>
          <select id="yearSelect-${project.projectId}">
            ${[...Array(5)].map((_, i) => {
                          const year = new Date().getFullYear() - i;
                          return `<option value="${year}">${year}</option>`;
                        }).join('')}
          </select>
          <label for="monthSelect-${project.projectId}">Month:</label>
          <select id="monthSelect-${project.projectId}">
            ${[...Array(12)].map((_, i) => {
                          const month = (i + 1).toString().padStart(2, '0');
                          return `<option value="${month}">${month}</option>`;
                        }).join('')}
          </select>
          <button id="confirmButton-${project.projectId}" style="margin-left: 10px;">Confirm</button>
          <div id="resultDiv-${project.projectId}" style="margin-top: 10px;"></div>
        </div>
      `;

                        // 添加事件监听器到 Confirm 按钮
                        document.getElementById(`confirmButton-${project.projectId}`).addEventListener('click', () => {
                          const selectedYear = document.getElementById(`yearSelect-${project.projectId}`).value;
                          const selectedMonth = document.getElementById(`monthSelect-${project.projectId}`).value;
                          const yearMonth = `${selectedYear}-${selectedMonth}`;
                          const resultDiv = document.getElementById(`resultDiv-${project.projectId}`);

                          fetch(`http://localhost:3000/api/student-working-hours/${studentId}?yearMonth=${yearMonth}`)
                            .then(response => response.json())
                            .then(data => {
                              if (data.success) {
                                resultDiv.innerHTML = '';
                                if (data.workingHours.length > 0) {
                                  data.workingHours.forEach(entry => {
                                    const entryDiv = document.createElement('div');
                                    entryDiv.className = 'project-box';
                                    entryDiv.innerHTML = `
                    <strong>Upload Date:</strong> ${entry.uploadDate}<br>
                    <strong>Working Hours:</strong> ${entry.workingHours}<br>
                    <strong>Status:</strong> ${entry.approvalStatus === 0
                                        ? 'Pending'
                                        : entry.approvalStatus === 1
                                          ? 'Approved'
                                          : 'Rejected'
                                      }<br>
                  `;
                                    resultDiv.appendChild(entryDiv);
                                  });
                                } else {
                                  resultDiv.textContent = 'No records found for the selected criteria.';
                                }
                              } else {
                                resultDiv.textContent = 'Failed to fetch data: ' + data.message;
                              }
                            })
                            .catch(error => {
                              console.error('Error fetching working hours:', error);
                              resultDiv.textContent = 'Error loading working hours.';
                            });
                        });
                      })
                      .catch(error => {
                        console.error('Error fetching working hours:', error);
                        uploadedHoursDiv.innerHTML = '<p>Error loading working hours.</p>';
                      });
                  }
                });

                const wageHistoryButton = document.createElement('button');
                wageHistoryButton.textContent = 'Wage History';
                wageHistoryButton.style.marginLeft = '10px';

                wageHistoryButton.addEventListener('click', () => {
                  const wageHistoryList = document.getElementById('wageHistoryList');
                  if (wageHistoryList.style.display === 'none' || wageHistoryList.dataset.projectId !== project.projectId) {
                    wageHistoryList.style.display = 'block';
                    wageHistoryList.dataset.projectId = project.projectId;
                    fetchWageHistory(project.projectId);
                  } else {
                    wageHistoryList.style.display = 'none';
                    wageHistoryList.dataset.projectId = '';
                  }
                });

                projectDiv.appendChild(uploadedHoursButton);
                projectDiv.appendChild(wageHistoryButton);
                projectDiv.appendChild(uploadedHoursDiv);
                studentProjectList.appendChild(projectDiv);
              });
            });
        } else {
          studentProjectList.textContent = 'No projects found.';
        }
      })
      .catch(error => console.error('Error fetching student projects:', error));
  }
  function fetchStudentProjects() {
    const studentId = localStorage.getItem('userId');
    const studentProjectList = document.getElementById('studentProjectList');
    studentProjectList.innerHTML = 'Loading...';

    // 获取项目基础数据
    fetch(`http://localhost:3000/api/student-projects/${studentId}`)
      .then(response => response.json())
      .then(projectsData => {
        if (!projectsData.success || !projectsData.projects.length) {
          studentProjectList.textContent = 'No projects found.';
          return;
        }

        // 获取工作时间数据
        return fetch(`http://localhost:3000/api/student-working-hours/${studentId}`)
          .then(response => response.json())
          .then(hoursData => {
            return {
              projects: projectsData.projects,
              workingHours: hoursData.success ? hoursData.workingHours : []
            };
          });
      })
      .then(({ projects, workingHours }) => {
        studentProjectList.innerHTML = '';

        projects.forEach(project => {
          // 创建项目容器
          const projectDiv = document.createElement('div');
          projectDiv.className = 'project-box';
          projectDiv.innerHTML = `
                    <strong>Project ID:</strong> ${project.projectId}<br>
                    <strong>Name:</strong> ${project.projectName}<br>
                    <strong>Leading Professor:</strong> ${project.leadingProfessor}<br>
                    <strong>Description:</strong> ${project.description}<br>
                    <strong>Hourly Payment:</strong> $${project.hourPayment}<br>
                    <strong>Start Date:</strong> ${project.startDate}<br>
                `;

          // ===================== 申报/取消模块 =====================
          const pendingRecord = workingHours.find(
            wh => wh.projectId === project.projectId && wh.approvalStatus === 0
          );

          // 申报输入组
          const declareGroup = document.createElement('div');
          declareGroup.style.marginTop = '10px';
          declareGroup.innerHTML = `
                    <label for="declareHours-${project.projectId}">Declare Working Hours:</label>
                    <input type="number" 
                           id="declareHours-${project.projectId}" 
                           placeholder="Enter hours"
                           ${pendingRecord ? 'disabled' : ''}>
                    <button onclick="declareWorkingHours('${project.projectId}')" 
                            ${pendingRecord ? 'disabled' : ''}>
                        ${pendingRecord ? 'Pending...' : 'Declare'}
                    </button>
                    ${pendingRecord ?
              `<button onclick="cancelWorkingHours('${project.projectId}')" 
                                style="margin-left:10px">
                            Cancel
                        </button>` : ''}
                `;

          // ===================== 工时记录模块 =====================
          const historyContainer = document.createElement('div');
          historyContainer.style.marginTop = '20px';

          // 记录切换按钮
          const toggleButtons = document.createElement('div');
          toggleButtons.innerHTML = `
                    <button class="toggle-btn active" data-panel="uploaded">Working Records</button>
                    <button class="toggle-btn" data-panel="wage">Wage History</button>
                `;

          // 记录内容容器
          const contentPanels = document.createElement('div');
          contentPanels.innerHTML = `
                    <div id="uploaded-${project.projectId}" class="content-panel"></div>
                    <div id="wage-${project.projectId}" class="content-panel" style="display:none"></div>
                `;

          // 组合模块
          historyContainer.appendChild(toggleButtons);
          historyContainer.appendChild(contentPanels);

          // 添加事件监听
          toggleButtons.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              // 切换按钮状态
              toggleButtons.querySelectorAll('.toggle-btn').forEach(b =>
                b.classList.remove('active'));
              btn.classList.add('active');

              // 切换面板显示
              const panelId = btn.dataset.panel;
              contentPanels.querySelectorAll('.content-panel').forEach(panel =>
                panel.style.display = 'none');
              document.getElementById(`${panelId}-${project.projectId}`)
                .style.display = 'block';
            });
          });

          // ===================== 组合所有元素 =====================
          projectDiv.appendChild(declareGroup);
          projectDiv.appendChild(historyContainer);
          studentProjectList.appendChild(projectDiv);

          // 初始化面板内容
          initUploadedPanel(project, contentPanels);
          initWagePanel(project, contentPanels);
        });
      })
      .catch(error => {
        console.error('Error:', error);
        studentProjectList.textContent = 'Error loading data.';
      });
    // 在fetchStudentProjects函数内完善面板内容
    function initUploadedPanel(project, container) {
      const panel = container.querySelector(`#uploaded-${project.projectId}`);
      panel.innerHTML = '<div class="loading">Loading working records...</div>';

      // 获取本月记录
      const yearMonth = new Date().toISOString().slice(0, 7);
      fetch(`http://localhost:3000/api/student-working-hours/${studentId}?yearMonth=${yearMonth}`)
        .then(response => response.json())
        .then(data => {
          panel.innerHTML = '';

          // 最新记录模块
          const latestSection = document.createElement('div');
          latestSection.className = 'record-section';
          if (data.workingHours.length > 0) {
            const latest = data.workingHours.reduce((a, b) =>
              new Date(a.uploadDate) > new Date(b.uploadDate) ? a : b
            );
            latestSection.innerHTML = `
                  <h4>Latest Submission</h4>
                  <p>Date: ${latest.uploadDate}</p>
                  <p>Hours: ${latest.workingHours}</p>
                  <p>Status: ${getStatusBadge(latest.approvalStatus)}</p>
                  ${latest.approvalStatus !== 0 ?
                `<button class="edit-trigger">Edit</button>
                       <div class="edit-form" style="display:none">
                           <input type="number" class="new-hours" placeholder="New hours">
                           <button class="save-edit">Save</button>
                       </div>` : ''}
              `;
          } else {
            latestSection.innerHTML = '<p>No submissions this month</p>';
          }
          panel.appendChild(latestSection);

          // 历史查询模块
          const historySection = document.createElement('div');
          historySection.className = 'history-query';
          historySection.innerHTML = `
              <h4>History Query</h4>
              <div class="date-picker">
                  <select class="year-select">
                      ${generateYearOptions()}
                  </select>
                  <select class="month-select">
                      ${generateMonthOptions()}
                  </select>
                  <button class="query-btn">Search</button>
              </div>
              <div class="query-results"></div>
          `;
          panel.appendChild(historySection);

          // 事件绑定
          panel.querySelector('.edit-trigger')?.addEventListener('click', () => {
            const form = panel.querySelector('.edit-form');
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
          });

          panel.querySelector('.save-edit')?.addEventListener('click', handleSaveEdit);
          panel.querySelector('.query-btn')?.addEventListener('click', handleHistoryQuery);
        });
    }

    function initWagePanel(project, container) {
      const panel = container.querySelector(`#wage-${project.projectId}`);
      panel.innerHTML = '<div class="loading">Loading wage history...</div>';

      fetch(`http://localhost:3000/api/wage-history/${studentId}/${project.projectId}`)
        .then(response => response.json())
        .then(data => {
          panel.innerHTML = '';

          if (data.success && data.history.length > 0) {
            const table = document.createElement('table');
            table.innerHTML = `
                  <tr>
                      <th>Payment Date</th>
                      <th>Hours</th>
                      <th>Rate</th>
                      <th>Amount</th>
                      <th>Status</th>
                  </tr>
                  ${data.history.map(entry => `
                      <tr>
                          <td>${entry.paymentDate}</td>
                          <td>${entry.hours}</td>
                          <td>$${entry.hourlyRate}</td>
                          <td>$${entry.amount}</td>
                          <td>${getPaymentStatus(entry.status)}</td>
                      </tr>
                  `).join('')}
              `;
            panel.appendChild(table);
          } else {
            panel.innerHTML = '<p>No wage records found</p>';
          }
        });
    }

    // 辅助函数
    function generateYearOptions() {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 5 }, (_, i) =>
        `<option value="${currentYear - i}">${currentYear - i}</option>`
      ).join('');
    }

    function generateMonthOptions() {
      return Array.from({ length: 12 }, (_, i) =>
        `<option value="${(i + 1).toString().padStart(2, '0')}">${(i + 1).toString().padStart(2, '0')}</option>`
      ).join('');
    }

    function getStatusBadge(status) {
      const badges = {
        0: '<span class="badge pending">Pending</span>',
        1: '<span class="badge approved">Approved</span>',
        2: '<span class="badge rejected">Rejected</span>'
      };
      return badges[status] || '';
    }

    function getPaymentStatus(status) {
      return status === 1 ? 'Paid' : 'Pending';
    }
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
