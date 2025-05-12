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

                <label for="editPr-${project.projectId}">Performance ratio:</label>
                <input type="number" id="editPr-${project.projectId}" placeholder="Performance ratio" value="${project.performanceRatio}"><br>
                
                <label for="editBd-${project.projectId}">Balance:</label>
                <input type="number" id="editBd-${project.projectId}" placeholder="Balance" value="${project.balance}"><br>
                
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
    const newPr = document.getElementById(`editPr-${projectId}`).value;
    const newBd = document.getElementById(`editBd-${projectId}`).value;
    const newPtInput = document.getElementById(`editPt-${projectId}`).value;
    const newPt = newPtInput.split(',').map(item => item.trim());
    
    const numHp = Number(newHp);
    const numPr = Number(newPr);
    const numBd = Number(newBd);

    // 验证所有数字输入必须为正整数
    if(numHp <= 0 || !Number.isInteger(numHp)) {
      alert("Hour Payment must be a positive integer!");
      return;
    }
    if(numPr <= 0 || !Number.isInteger(numPr)) {
      alert("Performance Ratio must be a positive integer!");
      return;
    }
    if(numBd <= 0 || !Number.isInteger(numBd)) {
      alert("Balance must be a positive integer!");
      return;
    }
    const participantRegex = /^\S+\(\S+\)$/;
    for (let participant of newPt) {
      if (!participantRegex.test(participant)) {
        alert("Input error: Each participant must be in the format 'ID(name)'.");
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

    // 验证所有数字输入必须为正整数
    if(hourPayment <= 0 || !Number.isInteger(hourPayment)){
      alert("Hour Payment must be a positive integer!");
      return;
    }
    if(performanceRatio <= 0 || !Number.isInteger(performanceRatio)){
      alert("Performance Ratio must be a positive integer!");
      return;
    }
    if(budget <= 0 || !Number.isInteger(budget)){
      alert("Budget must be a positive integer!");
      return;
    }
    const participantRegex = /^\S+\(\S+\)$/;
    for (let participant of participantsArr) {
      if (!participantRegex.test(participant)) {
        alert("Input error: Each participant must be in the format 'ID(name)'.");
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
                <button class=".button" onclick="fetchProjectDetails('${project.projectId}')">Participant details</button>
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

    // 点击Participants detail按钮后，显示学生详情
    function fetchProjectDetails(projectId) {
    let currentYear = new Date().getFullYear(); // 获取当前年份
    let currentMonth = new Date().toISOString().slice(0, 7); // 获取当前月份（格式：YYYY-MM）

    const projectDetailsDiv = document.getElementById('projectDetails');
    projectDetailsDiv.innerHTML = ''; // 清空内容

    // 创建日期导航
    const dateNav = document.createElement('div');
    dateNav.style.marginBottom = '10px';
    dateNav.innerHTML = `
        <label for="yearSelect">Year:</label>
        <select id="yearSelect">
            ${[...Array(5)].map((_, i) => {
                const year = currentYear - i;
                return `<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`;
            }).join('')}
        </select>
        <label for="monthSelect">Month:</label>
        <select id="monthSelect">
            ${[...Array(12)].map((_, i) => {
                const month = (i + 1).toString().padStart(2, '0');
                return `<option value="${month}" ${month === currentMonth.slice(5) ? 'selected' : ''}>${month}</option>`;
            }).join('')}
        </select>
        <button class="button" id="confirmButton" style="margin-left: 10px;">Confirm</button>
    `;
    projectDetailsDiv.appendChild(dateNav);

    // 创建一个占位符，后续用于显示筛选结果
    const resultDiv = document.createElement('div');
    resultDiv.id = 'resultDiv';
    projectDetailsDiv.appendChild(resultDiv);

    // 添加事件监听器到 Confirm 按钮
    document.getElementById('confirmButton').addEventListener('click', () => {
        const selectedYear = document.getElementById('yearSelect').value;
        const selectedMonth = document.getElementById('monthSelect').value;
        const yearMonth = `${selectedYear}-${selectedMonth}`;

        // 调用后端 API 获取数据
        fetch(`http://localhost:3000/api/project-student-details/${projectId}?yearMonth=${yearMonth}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const students = data.students;

                    // 更新页面显示结果
                    resultDiv.innerHTML = ''; // 清空之前的内容

                    if (students.length > 0) {
                        students.forEach(student => {
                            const entryDiv = document.createElement('div');
                            entryDiv.className = 'project-box'; // 添加样式类
                            entryDiv.innerHTML = `
                                <strong>Student ID:</strong> ${student.studentId}<br>
                                <strong>Student Name:</strong> ${student.studentName}<br>
                                <strong>Working Hours:</strong> ${student.workingHours !== null ? student.workingHours : 'Not Uploaded'}<br>
                                <strong>Approval Status:</strong> ${
                                    student.approvalStatus === 0
                                        ? 'Pending'
                                        : student.approvalStatus === 1
                                        ? 'Approved'
                                        : student.approvalStatus === 2
                                        ? 'Rejected'
                                        : 'Not Available'
                                }<br>
                                <strong>Performance Score:</strong> ${student.performanceScore !== null ? student.performanceScore : 'Not Assigned'}<br>
                                <button class="button" id="edit-${student.studentId}">Edit</button>
                                <div id="editDiv-${student.studentId}" style="display: none; margin-top: 10px;">
                                    <label for="approvalStatus-${student.studentId}">Approval Status:</label>
                                    <select id="approvalStatus-${student.studentId}">
                                        <option value="1" ${student.approvalStatus === 1 ? 'selected' : ''}>Approved</option>
                                        <option value="2" ${student.approvalStatus === 2 ? 'selected' : ''}>Rejected</option>
                                    </select><br>
                                    <label for="performanceScore-${student.studentId}">Performance Score:</label>
                                    <input type="number" id="performanceScore-${student.studentId}" value="${student.performanceScore || ''}" min="0" placeholder="Enter score"><br>
                                    <button class="button" id="update-${student.studentId}" style="margin-top: 10px;">Update</button>
                                </div>
                            `;
                            resultDiv.appendChild(entryDiv);

                            // 添加 Edit 按钮的点击事件
                            document.getElementById(`edit-${student.studentId}`).addEventListener('click', () => {
                                const editDiv = document.getElementById(`editDiv-${student.studentId}`);
                                editDiv.style.display = editDiv.style.display === 'none' ? 'block' : 'none';
                            });

                            // 添加 Update 按钮的点击事件
                            document.getElementById(`update-${student.studentId}`).addEventListener('click', () => {
                                const approvalStatus = document.getElementById(`approvalStatus-${student.studentId}`).value;
                                const performanceScore = document.getElementById(`performanceScore-${student.studentId}`).value;

                                // 验证 Performance Score 是否为正数
                                if (performanceScore !== '' && (performanceScore <= 0 || isNaN(performanceScore))) {
                                    alert('Performance Score must be a positive integer.');
                                    return; // 阻止提交
                                }

                                // 调用后端 API 更新数据
                                fetch(`http://localhost:3000/api/project-students/${projectId}/${student.studentId}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        approvalStatus: Number(approvalStatus),
                                        performanceScore: Number(performanceScore)
                                    })
                                })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        alert('Student information updated successfully!');
                                        // 重新加载学生信息
                                        document.getElementById('confirmButton').click();
                                    } else {
                                        alert('Failed to update student information: ' + data.message);
                                    }
                                })
                                .catch(error => console.error('Error updating student information:', error));
                            });
                        });
                    } else {
                        resultDiv.textContent = 'No records found for the selected criteria.';
                    }
                } else {
                    alert('Failed to fetch data: ' + data.message);
                }
            })
            .catch(error => console.error('Error fetching project student details:', error));
    });
    }

    // 点击Wage payment按钮后，显示工资支付情况
    function fetchWagePaymentSituation(projectId) {
    let currentYear = new Date().getFullYear(); // 获取当前年份
    let currentMonth = new Date().toISOString().slice(0, 7); // 获取当前月份（格式：YYYY-MM）

    const WagePaymentDetailsDiv = document.getElementById('WagePaymentDetails');
    WagePaymentDetailsDiv.innerHTML = ''; // 清空内容

    // 创建日期导航
    const dateNav = document.createElement('div');
    dateNav.style.marginBottom = '10px';
    dateNav.innerHTML = `
        <label for="yearSelect">Year:</label>
        <select id="yearSelect">
            ${[...Array(5)].map((_, i) => {
                const year = currentYear - i;
                return `<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`;
            }).join('')}
        </select>
        <label for="monthSelect">Month:</label>
        <select id="monthSelect">
            ${[...Array(12)].map((_, i) => {
                const month = (i + 1).toString().padStart(2, '0');
                return `<option value="${month}" ${month === currentMonth.slice(5) ? 'selected' : ''}>${month}</option>`;
            }).join('')}
        </select>
        <button class="button" id="confirmButton" class="button" style="margin-left: 10px;">Confirm</button>
    `;
    WagePaymentDetailsDiv.appendChild(dateNav);

    // 创建一个占位符，后续用于显示筛选结果
    const resultDiv = document.createElement('div');
    resultDiv.id = 'resultDiv';
    WagePaymentDetailsDiv.appendChild(resultDiv);

    // 确保事件监听器在按钮渲染后绑定
    setTimeout(() => {
        const confirmButton = document.getElementById('confirmButton');
        if (!confirmButton) {
            console.error('Confirm button not found in DOM.');
            return;
        }

        confirmButton.addEventListener('click', () => {
            const selectedYear = document.getElementById('yearSelect').value;
            const selectedMonth = document.getElementById('monthSelect').value;
            const yearMonth = `${selectedYear}-${selectedMonth}`;

            const apiUrl = `http://localhost:3000/api/wage-payment-status/${projectId}?yearMonth=${yearMonth}`;
            console.log('API URL:', apiUrl);

            // 调用后端 API 获取工资发放状态
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // 更新页面显示结果
                        resultDiv.innerHTML = ''; // 清空之前的内容

                        if (data.status.length > 0) {
                            data.status.forEach(entry => {
                                const entryDiv = document.createElement('div');
                                entryDiv.className = 'project-box'; // 添加样式类
                                entryDiv.innerHTML = `
                                    <strong>Student ID:</strong> ${entry.studentId}<br>
                                    <strong>Payment Status:</strong> ${entry.paymentStatus}<br>
                                    <button class="button" id="paiedButton-${entry.studentId}" style="margin-top: 5px;" ${
                                        entry.paymentStatus === 'Paied' ? 'disabled style="background-color: gray;"' : ''
                                    }>
                                        ${entry.paymentStatus === 'Paied' ? 'Paied' : 'Mark as Paied'}
                                    </button>
                                `;
                                resultDiv.appendChild(entryDiv);

                                // 如果状态为 "Unpaid"，添加点击事件
                                if (entry.paymentStatus === 'Unpaid') {
                                    document
                                        .getElementById(`paiedButton-${entry.studentId}`)
                                        .addEventListener('click', () => {
                                            // 调用后端 API 更新工资状态
                                            fetch(`http://localhost:3000/api/mark-wage-paied/${projectId}/${entry.studentId}?yearMonth=${yearMonth}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                            })
                                                .then(response => response.json())
                                                .then(updateData => {
                                                    if (updateData.success) {
                                                        alert('Payment status updated to "Paied" successfully!');
                                                        // 重新加载页面
                                                        document.getElementById('confirmButton').click();
                                                    } else {
                                                        alert('Failed to update payment status: ' + updateData.message);
                                                    }
                                                })
                                                .catch(error => console.error('Error updating payment status:', error));
                                        });
                                }
                            });
                        } else {
                            resultDiv.textContent = 'No payment records found for the selected criteria.';
                        }
                    } else {
                        alert('Failed to fetch wage payment status: ' + data.message);
                    }
                })
                .catch(error => console.error('Error fetching wage payment status:', error));
        });
    }, 0);
}
    // // 在fetchProjectDetails函数中，创建MonthNav、获取当前月份后，调用loadProjectDetailsByMonth函数加载当月详情
    // // function loadProjectDetailsByMonth(projectId, month) {
    // //   // 获取 performance_scores 和 working_hours 数据
    // //   Promise.all([
    // //     fetch(`http://localhost:3000/api/project-students/${projectId}?month=${month}`).then(res => res.json()),
    // //     fetch(`http://localhost:3000/api/project-working-hours/${projectId}`).then(res => res.json())
    // //   ])
    // //     .then(([performanceData, workingHoursData]) => {
    // //       const projectDetailsDiv = document.getElementById('projectDetails');
    // //       const studentListDiv = document.createElement('div');
    // //       studentListDiv.innerHTML = ''; // 清空学生列表
    
    // //       if (performanceData.success && performanceData.students.length > 0) {
    // //         performanceData.students.forEach(student => {
    // //           const studentDiv = document.createElement('div');
    // //           studentDiv.className = 'project-box'; // 添加样式类
    
    // //           // 查找该学生的工作时长审核数据
    // //           const workingHoursEntry = workingHoursData.workingHours.find(
    // //             entry => entry.studentId === student.studentId && entry.uploadDate.startsWith(month)
    // //           );
    
    // //           // 构建工作时长审核状态的展示
    // //           let workingHoursHTML = '';
    // //           if (workingHoursEntry) {
    // //             const { workingHours, approvalStatus } = workingHoursEntry;
    // //             let statusText = '';
    // //             let buttons = '';
    
    // //             if (approvalStatus === 0) {
    // //               statusText = 'Pending Approval';
    // //               buttons = `
    // //                 <button onclick="updateApprovalStatus('${projectId}', '${student.studentId}', 1)">Approve</button>
    // //                 <button onclick="updateApprovalStatus('${projectId}', '${student.studentId}', 2)">Reject</button>
    // //               `;
    // //             } else if (approvalStatus === 1) {
    // //               statusText = 'Approved';
    // //               buttons = `<button disabled style="background-color: lightgreen;">Approved</button>`;
    // //             } else if (approvalStatus === 2) {
    // //               statusText = 'Rejected';
    // //               buttons = `<button disabled style="background-color: lightcoral;">Rejected</button>`;
    // //             }
    
    // //             workingHoursHTML = `
    // //               <strong>Working Hours:</strong> ${workingHours}<br>
    // //               <strong>Status:</strong> ${statusText}<br>
    // //               ${buttons}
    // //             `;
    // //           } else {
    // //             workingHoursHTML = '<strong>Working Hours:</strong> Not Uploaded<br>';
    // //           }
    
    // //           // 构建学生信息和 performance score 的展示
    // //           studentDiv.innerHTML = `
    // //             <strong>Student ID:</strong> ${student.studentId}<br>
    // //             <strong>Name:</strong> ${student.studentName}<br>
    // //             <strong>Performance Score:</strong> 
    // //             <input type="number" id="score-${student.studentId}" value="${student.performanceScore || ''}" placeholder="Enter score">
    // //             <button onclick="updatePerformanceScore('${projectId}', '${student.studentId}', '${month}')">Update</button><br>
    // //             ${workingHoursHTML}
    // //           `;
    
    // //           studentListDiv.appendChild(studentDiv);
    // //         });
    // //       } else {
    // //         studentListDiv.textContent = "No students found for this project in the selected month.";
    // //       }
    
    // //       // 替换旧的学生列表
    // //       const oldStudentList = projectDetailsDiv.querySelector('.student-list');
    // //       if (oldStudentList) {
    // //         projectDetailsDiv.removeChild(oldStudentList);
    // //       }
    // //       studentListDiv.className = 'student-list';
    // //       projectDetailsDiv.appendChild(studentListDiv);
    // //     })
    // //     .catch(error => console.error("Error fetching project details:", error));
    // // }
    
    // function updatePerformanceScore(projectId, studentId, month) {
    //   const scoreInput = document.getElementById(`score-${studentId}`);
    //   const newScore = Number(scoreInput.value);
    
    //   // 通过api/project-students/${projectId}/${studentId}更新学生的performance score
    //   fetch(`http://localhost:3000/api/project-students/${projectId}/${studentId}`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ performanceScore: newScore, date: month })
    //   })
    //     .then(response => response.json())
    //     .then(data => {
    //       if (data.success) {
    //         alert("Performance score updated successfully!");
    //       } else {
    //         alert("Failed to update performance score: " + data.message);
    //       }
    //     })
    //     .catch(error => console.error("Error updating performance score:", error));
    // }
    // function updateApprovalStatus(projectId, studentId, status) {
    //   fetch(`http://localhost:3000/api/project-working-hours/${projectId}/${studentId}`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ approvalStatus: status })
    //   })
    //     .then(response => response.json())
    //     .then(data => {
    //       if (data.success) {
    //         alert("Update status successfully!");
    //         loadProjectDetailsByMonth(projectId, document.getElementById('currentMonth').textContent);
    //       } else {
    //         // 处理错误情况：比如后端判断计算出来的wage超过了budget，则无法更新Status，同时也无法发工资
    //         alert("Failed to update approval status: " + data.message);
    //       }
    //     })
    //     .catch(error => console.error("Error updating approval status:", error));
    // }

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
