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
  x_coefficient DECIMAL(5,2) DEFAULT 1.0, -- admin决定
  hour_payment DECIMAL(10,2), -- admin决定
  budget DECIMAL(15,2), -- admin决定
  balance DECIMAL(15,2) DEFAULT 0.00, 
  tid VARCHAR(10), -- 负责人
  start_date DATE,
  FOREIGN KEY (tid) REFERENCES teachers(id),
  CHECK (x_coefficient > 0),
  CHECK (hour_payment > 0),
  CHECK (budget > 0),
  CHECK (balance >= 0)
);

-- 项目参与者关联表（学生）
CREATE TABLE project_participants (
  pid VARCHAR(10),
  sid VARCHAR(10) NOT NULL,
  PRIMARY KEY (pid, sid),
  FOREIGN KEY (pid) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (sid) REFERENCES students(id)
);

-- 工时提交历史表
CREATE TABLE workload_declaration (
  sid VARCHAR(10) NOT NULL,
  pid VARCHAR(10),
  date DATE NOT NULL,
  hours DECIMAL(5,2),
  pscore INT,
  wage DECIMAL(10,2),
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'PAID') DEFAULT 'PENDING',
  UNIQUE (sid, pid, date),
  FOREIGN KEY (sid) REFERENCES students(id),
  FOREIGN KEY (pid) REFERENCES projects(id) ON DELETE SET NULL
);

DELIMITER //

CREATE TRIGGER enforce_single_pending
BEFORE INSERT ON workload_declaration
FOR EACH ROW
BEGIN
    IF NEW.status = 'PENDING' THEN
        IF EXISTS (
            SELECT 1 FROM workload_declaration 
            WHERE sid = NEW.sid AND status = 'PENDING' AND pid = NEW.pid
        ) THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = '每个学生只能有一条PENDING记录';
        END IF;
    END IF;
END//

CREATE TRIGGER delete_unpaid_workloads_on_project_delete
BEFORE DELETE ON projects
FOR EACH ROW
BEGIN
  DELETE FROM workload_declaration
  WHERE pid = OLD.id AND status <> 'PAID';
END//

DELIMITER ;

-- 年报视图
CREATE VIEW annual_reports AS
SELECT
  YEAR(wd.date) AS year,
  s.id AS studentId,
  s.name AS studentName,
  SUM(wd.wage) AS totalWage,
  AVG(wd.pscore) AS averageScore,
  MAX(wd.date) AS updatedOn
FROM
  workload_declaration wd
  JOIN students s ON wd.sid = s.id
WHERE
  wd.status = 'PAID'
GROUP BY
  YEAR(wd.date), s.id;

  -- 索引优化

  -- 项目参与者关联表常用查询索引
  CREATE INDEX idx_project_participants_sid ON project_participants(sid);
  CREATE INDEX idx_project_participants_pid ON project_participants(pid);

  -- workload_declaration常用查询索引
  CREATE INDEX idx_workload_sid_pid_status ON workload_declaration(sid, pid, status);
  CREATE INDEX idx_workload_pid_status ON workload_declaration(pid, status);
  CREATE INDEX idx_workload_status ON workload_declaration(status);
  CREATE INDEX idx_workload_date ON workload_declaration(date);

  -- projects表负责人查询索引
  CREATE INDEX idx_projects_tid ON projects(tid);