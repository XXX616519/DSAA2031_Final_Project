-- 清空现有数据（测试环境使用）
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE students;
TRUNCATE TABLE teachers;
TRUNCATE TABLE admins;
TRUNCATE TABLE projects;
TRUNCATE TABLE project_participants;
TRUNCATE TABLE workload_declaration;
TRUNCATE TABLE wage_payments;
SET FOREIGN_KEY_CHECKS = 1;

-- 生成100名学生数据（真实英文姓名）
INSERT INTO students (id, name, password)
WITH RECURSIVE student_seq AS (
  SELECT 1 AS n UNION ALL SELECT n+1 FROM student_seq WHERE n < 100
)
SELECT 
  CONCAT('S', LPAD(n, 3, '0')),
  CONCAT(
    ELT(FLOOR(1 + RAND() * 20),
      'James', 'Mary', 'John', 'Patricia', 'Robert', 
      'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
      'David', 'Susan', 'Joseph', 'Jessica', 'Thomas',
      'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy'),
    ' ',
    ELT(FLOOR(1 + RAND() * 20),
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
      'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson',
      'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez',
      'Moore', 'Martin', 'Jackson', 'Thompson', 'White')
  ),
  'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
FROM student_seq;

-- 生成30名教师数据（真实英文姓名）
INSERT INTO teachers (id, name, password)
WITH RECURSIVE teacher_seq AS (
  SELECT 1 AS n UNION ALL SELECT n+1 FROM teacher_seq WHERE n < 30
)
SELECT 
  CONCAT('T', LPAD(n, 2, '0')),
  CONCAT(
    'Prof. ',
    ELT(FLOOR(1 + RAND() * 15),
      'Alexander', 'Margaret', 'Henry', 'Emma', 'Richard',
      'Catherine', 'Edward', 'Alice', 'George', 'Dorothy',
      'Arthur', 'Grace', 'Albert', 'Emily', 'Louis'),
    ' ',
    ELT(FLOOR(1 + RAND() * 20),
      'Wilson', 'Taylor', 'Clark', 'Young', 'Harris',
      'Lewis', 'Walker', 'Hall', 'Allen', 'Scott',
      'King', 'Green', 'Evans', 'Baker', 'Adams',
      'Nelson', 'Carter', 'Mitchell', 'Parker', 'Cook')
  ),
  'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
FROM teacher_seq;

-- 生成5名管理员（保持简单格式）
INSERT INTO admins (id, name, password)
WITH RECURSIVE admin_seq AS (
  SELECT 1 AS n UNION ALL SELECT n+1 FROM admin_seq WHERE n < 5
)
SELECT 
  CONCAT('A', LPAD(n, 2, '0')),
  CONCAT('Admin_', LPAD(n, 2, '0')),
  'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
FROM admin_seq;

-- 生成40个项目（2024-2025年）
INSERT INTO projects (id, name, description, x_coefficient, hour_payment, budget, balance, tid, start_date)
SELECT 
  CONCAT('P', LPAD(p.id, 3, '0')),
  CONCAT('Project_', 
    CASE 
      WHEN p.id % 4 = 0 THEN 'AI'
      WHEN p.id % 4 = 1 THEN 'Blockchain'
      WHEN p.id % 4 = 2 THEN 'Biotech'
      ELSE 'Quantum'
    END, '_', LPAD(p.id, 3, '0')),
  CONCAT('Research project on ', 
    CASE 
      WHEN p.id % 4 = 0 THEN 'Artificial Intelligence'
      WHEN p.id % 4 = 1 THEN 'Blockchain Technology'
      WHEN p.id % 4 = 2 THEN 'Biomedical Engineering'
      ELSE 'Quantum Computing'
    END),
  ROUND(0.5 + RAND() * 1.5, 2),
  ROUND(30 + RAND() * 70, 2),
  p.budget,
  ROUND(p.budget * 0.7, 2),
  CONCAT('T', LPAD(1 + FLOOR(RAND() * 29), 2, '0')),
  DATE_ADD('2024-01-01', INTERVAL FLOOR(RAND() * 450) DAY)
FROM (
  SELECT n AS id,ROUND(5000 + RAND() * 15000, 2) AS budget FROM (
    WITH RECURSIVE seq AS (
      SELECT 1 AS n UNION ALL SELECT n+1 FROM seq WHERE n < 40
    ) SELECT n FROM seq
  ) nums
) p;

-- 项目参与者分配（每个项目5-15名学生）
INSERT INTO project_participants (pid, sid)
SELECT 
  p.id,
  s.id
FROM projects p
JOIN students s ON s.id = CONCAT('S', LPAD(1 + FLOOR(RAND() * 100), 3, '0'))
WHERE (
  SELECT COUNT(*) 
  FROM project_participants pp 
  WHERE pp.sid = s.id
) < 2
  AND NOT EXISTS (
    SELECT 1 
    FROM project_participants pp 
    WHERE pp.pid = p.id 
      AND pp.sid = s.id
  );

-- 生成工时申报数据（2024-2025年）
-- INSERT INTO workload_declaration (sid, pid, date, hours, pscore, wage, status)
-- ...（如需生成可参考原注释代码）...

-- 计算并更新已批准记录的工资
UPDATE workload_declaration wd
JOIN projects p ON wd.pid = p.id
SET wd.wage = ROUND(wd.hours * p.hour_payment * 
  CASE 
    WHEN wd.pscore IS NULL THEN 1.0
    ELSE p.x_coefficient * (wd.pscore / 100)
  END, 2)
WHERE wd.status IN ('APPROVED', 'PAID');

-- annual_reports 已为视图，无需插入数据

-- 更新项目余额（基于已支付工资）
UPDATE projects p
SET p.balance = p.budget - IFNULL((
  SELECT SUM(wd.wage)
  FROM workload_declaration wd
  WHERE wd.pid = p.id AND wd.status = 'PAID'
), 0)
WHERE p.budget > IFNULL((
  SELECT SUM(wd.wage)
  FROM workload_declaration wd
  WHERE wd.pid = p.id AND wd.status = 'PAID'
), 0);
