// 从 localStorage 获取用户信息
const userId = localStorage.getItem('userId');
const userName = localStorage.getItem('userName');
const role = localStorage.getItem('role');
const userInfoDiv = document.getElementById('userInfo');


// 学生登录，显示学生信息
userInfoDiv.textContent = `Logged in as Student: ${userName} (ID: ${userId})`;
// ...existing code...

// 学生使用的function:


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
function declareWorkingHours(projectId) {
    const workingHours = document.getElementById(`declareHours-${projectId}`).value;
    const date = new Date().toISOString().slice(0, 10); // 获取当前日期，格式为 YYYY-MM-DD

    // 通过api/upload-working-hours上传工作时间数据
    fetch('http://localhost:3000/api/declare-working-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid: projectId, sid: userId, hours: Number(workingHours), date }) // 传入所有参数
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchStudentProjects(); // 刷新项目列表
                alert("Working hours uploaded successfully!");
            } else {
                alert("Failed to upload working hours: " + data.message);
            }
        })
        .catch(error => console.error("Error uploading working hours:", error));
}

// 获取学生项目数据并显示在页面上
function fetchStudentProjects() {
    const studentId = localStorage.getItem('userId');
    const studentProjectList = document.getElementById('studentProjectList');
    studentProjectList.innerHTML = 'Loading...';

    // 获取项目基础数据
    fetch(`http://localhost:3000/api/student-projects/${studentId}`)
        .then(response => response.json())
        .then(projectsData => projectsData.projects)
        .then(projects => {
            studentProjectList.innerHTML = '';
            projects.forEach(project => {
                // 创建项目容器
                const projectDiv = document.createElement('div');
                console.log("project:", project);
                projectDiv.className = 'project-box';
                projectDiv.innerHTML = `
                  <strong>Project ID:</strong> ${project.projectId}<br>
                  <strong>Name:</strong> ${project.projectName}<br>
                  <strong>Leading Professor:</strong> ${project.teacherName}<br>
                  <strong>Description:</strong> ${project.projectDescription}<br>
                  <strong>Hourly Payment:</strong> $${project.hourlyPayment}<br>
                  <strong>Start Date:</strong> ${project.startDate}<br>
              `;

                // ===================== 申报/取消模块 =====================
                // 申报输入组
                const declareGroup = document.createElement('div');
                declareGroup.style.marginTop = '10px';

                fetch(`http://localhost:3000/api/student-working-hours/${studentId}?pid=${project.projectId}&newest=true`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && data.workingHours.length > 0) {
                            const latestRecord = data.workingHours[0];
                            return latestRecord.approvalStatus === 'PENDING';
                        }
                        return false;
                    })
                    .then(pendingRecord => {
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
                    });
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
        const pid = project.projectId;
        const panel = container.querySelector(`#uploaded-${pid}`);
        panel.innerHTML = '<div class="loading">Loading working records...</div>';

        // 最新记录模块
        fetch(`http://localhost:3000/api/student-working-hours/${studentId}?pid=${pid}&newest=true`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }
        )
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    panel.innerHTML = `<p>${data.message}</p>`;
                    return;
                }
                panel.innerHTML = '';
                const { workingHours } = data;
                const latestSection = document.createElement('div');
                latestSection.className = 'record-section';
                if (workingHours.length > 0) {
                    const latest = workingHours[0];
                    console.log(latest);
                    latestSection.innerHTML = `
                <h4>Latest Submission</h4>
                <p>Date: ${latest.workDate}</p>
                <p>Hours: ${latest.workHours}</p>
                <p>Status: ${latest.approvalStatus}</p>
            `;
                } else {
                    latestSection.innerHTML = '<p>No submissions this month</p>';
                }
                panel.appendChild(latestSection);
            });


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
        panel.querySelector('.query-btn')?.addEventListener('click', () => { console.log('test'); });
    }

    function initWagePanel(project, container) {
        const panel = container.querySelector(`#wage-${project.projectId}`);
        panel.innerHTML = '<div class="loading">Loading wage history...</div>';

        fetch(`http://localhost:3000/api/wage-history/${studentId}?projectId=${project.projectId}`)
            .then(response => response.json())
            .then(data => {
                panel.innerHTML = '';

                if (data.success && data.history.length > 0) {
                    const table = document.createElement('table');
                    table.style.margin = 'auto';
                    table.innerHTML = `
                <tr>
                    <th>Payment Date</th>
                    <th>Hours</th>
                    <th>Performance</th>
                    <th>Amount</th>
                </tr>
                ${data.history.map(entry => `
                    <tr>
                        <td>${entry.paymentDate}</td>
                        <td>${entry.workedHours}</td>
                        <td>${entry.performanceScore}</td>
                        <td>$${entry.amount}</td>
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
