DROP DATABASE IF EXISTS payroll;
CREATE DATABASE payroll;
USE payroll;

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
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  x_coefficient DECIMAL(5,2) DEFAULT 1.0, -- 教授决定
  hour_payment DECIMAL(10,2), -- admin决定
  budget DECIMAL(15,2), -- admin决定
  balance DECIMAL(15,2) DEFAULT 0.00, -- 自动计算
  tid VARCHAR(10),
  start_date DATE,
  FOREIGN KEY (tid) REFERENCES teachers(id),
  CHECK (x_coefficient > 0),
  CHECK (hour_payment > 0),
  CHECK (budget > 0),
  CHECK (balance >= 0)
);

-- 项目参与者关联表（学生）
CREATE TABLE project_participants (
  pid VARCHAR(10) NOT NULL,
  sid VARCHAR(10) NOT NULL,
  PRIMARY KEY (pid, sid),
  FOREIGN KEY (pid) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (sid) REFERENCES students(id)
);

-- 工时提交历史表
CREATE TABLE workload_declaration (
  sid VARCHAR(10),
  pid VARCHAR(10),
  date DATE NOT NULL,
  hours DECIMAL(5,2),
  pscore INT,
  wage DECIMAL(10,2),
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'PAYED') DEFAULT 'PENDING',
  PRIMARY KEY (sid, pid, date),
  FOREIGN KEY (sid) REFERENCES students(id),
  FOREIGN KEY (pid) REFERENCES projects(id) ON DELETE CASCADE
);

-- 工资发放历史
CREATE TABLE wage_payments (
  -- id INT AUTO_INCREMENT PRIMARY KEY,
  sid VARCHAR(10),
  pid VARCHAR(10),
  date DATE NOT NULL,
  hours DECIMAL(5,2),
  pscore INT,
  hourp DECIMAL(10,2),
  prate DECIMAL(10,2),
  FOREIGN KEY (sid) REFERENCES students(id),
  FOREIGN KEY (pid) REFERENCES projects(id) ON DELETE SET NULL
);

-- 年报表
CREATE TABLE annual_reports(
  year INT NOT NULL,
  studentId VARCHAR(10),
  studentName VARCHAR(50),
  totalWage DECIMAL(15, 2),
  averageScore DECIMAL(5, 2),
  PRIMARY KEY(year, studentId),
  FOREIGN KEY(studentId) REFERENCES students(id)
);