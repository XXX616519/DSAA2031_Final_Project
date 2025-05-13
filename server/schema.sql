-- 用户表
CREATE TABLE students (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL
);

CREATE TABLE teachers (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL
);

CREATE TABLE admins (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL
);

-- 项目表
CREATE TABLE projects (
  project_id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  -- x系数
  x_coefficient DECIMAL(5,2) DEFAULT 1.0, -- 教授决定
  hour_payment DECIMAL(10,2), -- admin决定
  budget DECIMAL(15,2), -- admin决定
  balance DECIMAL(15,2) DEFAULT 0.00, -- 自动计算
  leading_teacher_id VARCHAR(10),
  start_date DATE,
  FOREIGN KEY (leading_teacher_id) REFERENCES teachers(teacher_id),
  CHECK (hour_payment > 0),
  CHECK (budget > 0).
  CHECK (balance >= 0)
);

-- 项目参与者关联表（学生）
CREATE TABLE project_participants (
  pid VARCHAR(10) NOT NULL,
  sid VARCHAR(10) NOT NULL,
  PRIMARY KEY (pid, sid),
  FOREIGN KEY (pid) REFERENCES projects(project_id),
  FOREIGN KEY (sid) REFERENCES students(id)
);

-- 工时提交历史表
CREATE TABLE wage_history (
  -- id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(10),
  project_id VARCHAR(10),
  date DATE NOT NULL,
  hours_worked DECIMAL(5,2),
  performance_score INT,
  wage DECIMAL(10,2),
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'PAYED') DEFAULT 'PENDING',
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

-- 工资发放历史
CREATE TABLE wage_payments (
  -- id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(10),
  project_id VARCHAR(10),
  date DATE NOT NULL,
  amount DECIMAL(10,2),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (project_id) REFERENCES projects(project_id)
);
