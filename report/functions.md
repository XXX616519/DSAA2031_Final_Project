# **Login System**  

## 1.Organizational and Role Analysis

### Three user roles can log in to the frontend: **Student**, **Teacher**, and **Admin**.  


### **Student Permissions**  
1. **View Projects**  
   - Access participating projects with details:  
     - `project_id`  
     - `project_name`  
     - `base_hourly_pay` of the project  
     - `payment_history`  

2. **Performance & Wage Tracking**  
   - After the teacher evaluates performance_score, students can view:  
     - `wage_payment_date`  
     - `performance_score` from the teacher  
     - `final_wage` calculated as:  
       ```
       wage = (performance_rating × performance_score) + (working_hours × base_hourly_pay)
       ```  
   - **Editable Field**:  
     - Students can only submit/modify their own `working_hours`.  

---

### **Teacher Permissions**  
1. **Manage Projects**  
   - View all projects they lead and their participants, including:  
     - `project_id`  
     - `project_name`  
     - `project_budget` 
     - `student_id`
     - `student_name`

2. **Student Evaluation, Project Rating & Wage Configuration**  
   - Assign a `performance_rating` to each project.
   - When a teacher approves a student's working hours, they will assign a `performance_score​` to the student.  
   - ```
     wage = (performance_rating × performance_score) + (working_hours × base_hourly_pay)
     ```  

---

### **Admin Permissions**  
1. **Project Oversight**  
   - View all projects with details and their participants:  
     - `project_id`  
     - `project_name`  
     - `project_budget`
     - `student_id`
     - `student_name`  

2. **Full Editing Privileges**  
   - Modify:  
     - `project_budget`  
     - `base hourly pay` of projects
     - `performance_rating` to each project  
     - Student-project assignments (add/remove students from projects).  

3. **Reporting**  
   - Generate and view annual summary reports.  

---

## 2.Business Process Analysis

### **1. Student Submits/Modifies Working Hours**  
**Initiator**: Student  
**Steps & Data**:  
1. The student logs into the system and navigate to their enrolled project page.  
2. Enters or modifies the `working_hours` field in the project details and submits the form.  
3. The system validates the data format (e.g., numeric value, within a reasonable range).  

**Expected Output**:  
- Updates the `working_hours` value in the database upon successful submission.  
- Triggers the next step: Teachers can review and approve/score the student’s working hours.  

---

### **2. Teacher Approves Working Hours and Assigns Performance Score**  
**Initiator**: Teacher  
**Steps & Data**:  
1. The teacher logs in, navigates to their managed project page, and reviews the student-submitted `working_hours`.  
2. Validates the reasonableness of the working hours (e.g., alignment with project timelines).  
3. After approval, assigns a `performance_score` to the student.  
4. The system automatically calculates the `final_wage` using the formula:  
   ```  
   final_wage = (performance_rating × performance_score) + (working_hours × base_hourly_pay)  
   ```  
**Expected Output**:  
- Updates the student’s `performance_score` and associated `final_wage`.  
- The student can view the approval status and final wage on their interface.  


---

### **3. Admin Manages Project Budget & Student Assignments**  
**Initiator**: Admin  
**Steps & Data**:  
1. The Admin modifies `project_budget` (project budget), `base_hourly_pay` (base hourly rate), `performance_rating` in the project management interface.  
2. Adds/removes students via the "Student-Project Assignment" module using `student_id` or `student_name`.  
3. The system validates budget changes (e.g., ensuring the new budget does not fall below total wages already disbursed).  

**Expected Output**:  
- Updates project metadata (budget, hourly rate, performance_rating).  
- Adjusts student enrollment relationships, which are reflected in Teacher/Student views.  

---

### **4. Admin Generates Annual Summary Report**  
**Initiator**: Admin  
**Steps & Data**:  
1. The Admin selects a time range (e.g., fiscal year) and clicks "Generate Report" in the reporting interface.  
2. The system aggregates data, including:  
   - `project_budget` utilization across all projects.  
   - Total wages disbursed to students.  
   - Distribution of teacher-assigned `performance_score` (e.g., average scores).

**Expected Output**:  
- A downloadable or previewable PDF/Excel report with charts and tables summarizing annual data.  
---

### Bonus: use-case diagrams

**Students**
![alt text](image.png)
**Teachers**
![alt text](image-1.png)
**Admin**
![alt text](image-2.png)

## 3. Data Flow Diagrams (DFDs)
![alt text](<Blank diagram (2).png>)

## 4. ER Diagram
