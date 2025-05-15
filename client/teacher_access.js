// 从 localStorage 获取用户信息
const userId = localStorage.getItem('userId');
const userName = localStorage.getItem('userName');
const role = localStorage.getItem('role');
const userInfoDiv = document.getElementById('userInfo');


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
    <select class="yearSelect">
        ${[...Array(5)]
            .map((_, i) => {
                const year = currentYear - i;
                return `<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`;
            })
            .join('')}
    </select>
    <label for="monthSelect">Month:</label>
    <select class="monthSelect">
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
function createDateNavigation2(currentYear, currentMonth) {
    const dateNav = document.createElement('div');
    dateNav.style.marginBottom = '10px';
    dateNav.innerHTML = `
    <label for="yearSelect">Year:</label>
    <select class="yearSelect">
        ${[...Array(5)]
            .map((_, i) => {
                const year = currentYear - i;
                return `<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`;
            })
            .join('')}
    </select>
    <label for="monthSelect">Month:</label>
    <select class="monthSelect">
        ${[...Array(12)]
            .map((_, i) => {
                const month = (i + 1).toString().padStart(2, '0');
                return `<option value="${month}" ${month === currentMonth ? 'selected' : ''}>${month}</option>`;
            })
            .join('')}
    </select>
    <button class="button" id="confirmButton2" style="margin-left: 10px;">Confirm</button>
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
        const date = new Date(student.uploadDate).toISOString().slice(0, 10);
        // const date = student.uploadDate;
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
            // const date = new Date().toISOString().slice(0, 10); // 获取当前日期，格式为 YYYY-MM-DD
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
        const selectedYear = confirmButton.parentElement.querySelector('.yearSelect').value;
        const selectedMonth = confirmButton.parentElement.querySelector('.monthSelect').value;
        // 校验不能选择未来日期
        const month = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        if (month > new Date().toISOString().slice(0, 7)) {
            alert('Error: You cannot select a future date.');
            return;
        }
        
        // 调用后端 API 获取对应年月的学生详情
        fetch(`http://localhost:3000/api/project-students/${projectId}?month=${month}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
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
  <h1>Working Hours Approval</h1>
  <p>Here are Project ${projectId} participant working hours approval details:</p>
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
                document.getElementById('confirmButton2').click(); // Refresh the data
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
    <strong>Performance Score:</strong> ${wage.performance}<br>
    <strong>Wage Amount:</strong> $${wage.wageAmount}<br
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
    const confirmButton = document.getElementById('confirmButton2');
    confirmButton.addEventListener('click', () => {
        const selectedYear = confirmButton.parentElement.querySelector('.yearSelect').value;
        const selectedMonth = confirmButton.parentElement.querySelector('.monthSelect').value;
        // 校验不能选择未来日期
        const month = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        if (month > new Date().toISOString().slice(0, 7)) {
            alert('Error: You cannot select a future date.');
            return;
        }
        // 调用后端 API 获取对应年月的工资支付情况
        fetch(`http://localhost:3000/api/wage-paid-condition/${projectId}?yearMonth=${month}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
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
    const dateNav = createDateNavigation2(currentYear, currentMonth);
    WagePaymentDetailsDiv.appendChild(dateNav);

    // 添加显示结果的占位符
    const resultDiv = document.createElement('div');
    resultDiv.id = 'resultDiv';
    WagePaymentDetailsDiv.appendChild(resultDiv);

    attachConfirmHandler_wage(projectId, currentYear, currentMonth, resultDiv);
}

