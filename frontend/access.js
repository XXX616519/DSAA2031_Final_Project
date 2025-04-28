 // 从 localStorage 获取用户信息
 const userId = localStorage.getItem('userId');
 const userName = localStorage.getItem('userName');
 const role = localStorage.getItem('role');
 
 const userInfoDiv = document.getElementById('userInfo');
 
 
 if(role === 'admin') {
    // 管理员登录，显示管理员信息
    userInfoDiv.textContent = `Logged in as Admin: ${userName} (ID: ${userId})`;
    fetch(`http://localhost:3000/api/projects`)
   .then(response => response.json())
   .then(data => {
     if(data.success) {
       const projectsDiv = document.getElementById('projects');
       if(data.projects.length === 0) {
         projectsDiv.textContent = "No projects found.";
       } else {
         // 显示项目列表
         data.projects.forEach(project => {
           const p = document.createElement('p');
           p.textContent = `${project.projectName}: ${project.description}`;
           projectsDiv.appendChild(p);
         });
       }
     } else {
       console.error("Failed to retrieve projects:", data.message);
     }
   })
   .catch(error => console.error("Error fetching projects:", error));
     }
 else if(role === 'teacher') {
    // 教师登录，显示教师信息
    userInfoDiv.textContent = `Logged in as Teacher: ${userName} (ID: ${userId})`;
 }
 else if(role ==='student') {
    // 学生登录，显示学生信息
    userInfoDiv.textContent = `Logged in as Student: ${userName} (ID: ${userId})`;
 }
 // 调用项目API获取数据
 
