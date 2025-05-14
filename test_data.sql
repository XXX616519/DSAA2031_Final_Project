-- 清空现有数据（测试环境使用）
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE students;
TRUNCATE TABLE teachers;
TRUNCATE TABLE admins;
TRUNCATE TABLE projects;
TRUNCATE TABLE project_participants;
TRUNCATE TABLE workload_declaration;
TRUNCATE TABLE wage_payments;
TRUNCATE TABLE annual_reports;
SET FOREIGN_KEY_CHECKS = 1;

-- 生成100名学生数据（真实英文姓名）
INSERT INTO students (id, name, password)
WITH RECURSIVE student_seq AS (
  SELECT 1 AS n UNION ALL SELECT n+1 FROM student_seq WHERE n < 100
)
SELECT 
  CONCAT('S', LPAD(n, 3, '0')),
  CONCAT(
    ELT(FLOOR(1 + RAND() * 20), -- 20个常见英文名
      'James', 'Mary', 'John', 'Patricia', 'Robert', 
      'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
      'David', 'Susan', 'Joseph', 'Jessica', 'Thomas',
      'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy'),
    ' ',
    ELT(FLOOR(1 + RAND() * 20), -- 20个常见英文姓氏
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
      'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson',
      'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez',
      'Moore', 'Martin', 'Jackson', 'Thompson', 'White')
  ),
  'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3' -- 统一密码
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
    ELT(FLOOR(1 + RAND() * 15), -- 15个学术常见英文名
      'Alexander', 'Margaret', 'Henry', 'Emma', 'Richard',
      'Catherine', 'Edward', 'Alice', 'George', 'Dorothy',
      'Arthur', 'Grace', 'Albert', 'Emily', 'Louis'),
    ' ',
    ELT(FLOOR(1 + RAND() * 20), -- 20个学术常见姓氏
      'Wilson', 'Taylor', 'Clark', 'Young', 'Harris',
      'Lewis', 'Walker', 'Hall', 'Allen', 'Scott',
      'King', 'Green', 'Evans', 'Baker', 'Adams',
      'Nelson', 'Carter', 'Mitchell', 'Parker', 'Cook')
  ),
  'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3' -- 统一密码
FROM teacher_seq;

-- 生成5名管理员（保持简单格式）
INSERT INTO admins (id, name, password)
WITH RECURSIVE admin_seq AS (
  SELECT 1 AS n UNION ALL SELECT n+1 FROM admin_seq WHERE n < 5
)
SELECT 
  CONCAT('A', LPAD(n, 2, '0')),
  CONCAT('Admin_', LPAD(n, 2, '0')),
  'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3' -- 统一密码
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
  ROUND(0.5 + RAND() * 1.5, 2), -- x_coefficient 0.5-2.0
  ROUND(30 + RAND() * 70, 2),    -- hour_payment 30-100
  p.budget, -- budget 5k-20k
  ROUND(p.budget * 0.7, 2), -- balance 70% of budget
  CONCAT('T', LPAD(1 + FLOOR(RAND() * 29), 2, '0')),
  DATE_ADD('2024-01-01', INTERVAL FLOOR(RAND() * 450) DAY) -- 2024-01-01 to 2025-04-15
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
-- WITH RECURSIVE dates AS (
--   SELECT '2024-01-01' AS date
--   UNION ALL
--   SELECT DATE_ADD(date, INTERVAL 1 DAY) FROM dates 
--   WHERE date < '2025-04-30'
-- )
-- SELECT 
--   pp.sid,
--   pp.pid,
--   d.date,
--   ROUND(1 + RAND() * 8, 2), -- 1-9小时
--   CASE 
--     WHEN RAND() > 0.1 THEN 60 + FLOOR(RAND() * 40) -- 60-100分
--     ELSE NULL -- 10%概率未评分
--   END,
--   NULL, -- 初始wage为NULL
--   CASE 
--     WHEN d.date < DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) THEN 
--       ELT(1 + FLOOR(RAND() * 4), 'PENDING', 'APPROVED', 'REJECTED', 'PAID')
--     ELSE 'PENDING' -- 最近30天的记录保持PENDING
--   END
-- FROM project_participants pp
-- JOIN dates d ON 
--   d.date BETWEEN (SELECT start_date FROM projects WHERE id = pp.pid) AND '2025-04-30'
-- WHERE 
--   DAYOFWEEK(d.date) BETWEEN 2 AND 6 -- 仅工作日
--   AND RAND() > 0.7 -- 70%概率不申报某天
-- LIMIT 5000 -- 约5000条记录
-- ON DUPLICATE KEY UPDATE status='REJECTED';

-- 计算并更新已批准记录的工资
UPDATE workload_declaration wd
JOIN projects p ON wd.pid = p.id
SET wd.wage = ROUND(wd.hours * p.hour_payment * 
  CASE 
    WHEN wd.pscore IS NULL THEN 1.0
    ELSE p.x_coefficient * (wd.pscore / 100)
  END, 2)
WHERE wd.status IN ('APPROVED', 'PAID');

-- 生成工资发放记录（从已批准记录中复制）
INSERT INTO wage_payments (sid, pid, date, hours, pscore, hourp, prate)
SELECT 
  wd.sid,
  wd.pid,
  wd.date,
  wd.hours,
  wd.pscore,
  p.hour_payment,
  ROUND(
    CASE 
      WHEN wd.pscore IS NULL THEN 1.0
      ELSE p.x_coefficient * (wd.pscore / 100)
    END, 2
  )
FROM workload_declaration wd
JOIN projects p ON wd.pid = p.id
WHERE wd.status = 'PAID';

-- 生成年度报表数据（2024年）
INSERT INTO annual_reports (year, studentId, studentName, totalWage, averageScore)
SELECT 
  2024,
  s.id,
  s.name,
  ROUND(SUM(wd.wage), 2),
  ROUND(AVG(wd.pscore), 2)
FROM students s
JOIN workload_declaration wd ON s.id = wd.sid
JOIN projects p ON wd.pid = p.id
WHERE YEAR(wd.date) = 2024 AND wd.status = 'PAID' AND wd.pscore IS NOT NULL
GROUP BY s.id, s.name;

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