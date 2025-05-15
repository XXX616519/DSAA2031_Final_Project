SET @@cte_max_recursion_depth = 6000;

-- 清空现有数据（测试环境使用）
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE students;
TRUNCATE TABLE teachers;
TRUNCATE TABLE admins;
TRUNCATE TABLE projects;
TRUNCATE TABLE project_participants;
TRUNCATE TABLE workload_declaration;
SET FOREIGN_KEY_CHECKS = 1;

-- 生成5000名学生数据（真实英文姓名）
INSERT INTO students (id, name, password)
WITH RECURSIVE student_seq AS (
  SELECT 1 AS n UNION ALL SELECT n+1 FROM student_seq WHERE n < 5000
)
SELECT 
  CONCAT('S', LPAD(n, 4, '0')),
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

-- 生成1000名教师数据（真实英文姓名）
INSERT INTO teachers (id, name, password)
WITH RECURSIVE teacher_seq AS (
  SELECT 1 AS n UNION ALL SELECT n+1 FROM teacher_seq WHERE n < 1000
)
SELECT 
  CONCAT('T', LPAD(n, 4, '0')),
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

-- 生成1000个项目（2024-2025年）
INSERT INTO projects (id, name, description, x_coefficient, hour_payment, budget, balance, tid, start_date)
SELECT 
  CONCAT('P', LPAD(p.id, 4, '0')),
  CONCAT('Project_', 
    CASE 
      WHEN p.id % 4 = 0 THEN 'AI'
      WHEN p.id % 4 = 1 THEN 'Blockchain'
      WHEN p.id % 4 = 2 THEN 'Biotech'
      ELSE 'Quantum'
    END, '_', LPAD(p.id, 4, '0')),
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
  CONCAT('T', LPAD(1 + FLOOR(RAND() * 1000), 4, '0')),
  DATE_ADD('2024-01-01', INTERVAL FLOOR(RAND() * 450) DAY)
FROM (
  SELECT n AS id,ROUND(5000 + RAND() * 15000, 2) AS budget FROM (
    WITH RECURSIVE seq AS (
      SELECT 1 AS n UNION ALL SELECT n+1 FROM seq WHERE n < 1000
    ) SELECT n FROM seq
  ) nums
) p;

-- 项目参与者分配（每个项目10-15名学生，每个学生最多2个项目，每5个学生至少有1个加入项目）
INSERT INTO project_participants (pid, sid)
SELECT pid, sid FROM (
  SELECT 
    p.id AS pid,
    s.id AS sid,
    ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY RAND()) AS rn,
    (
      SELECT COUNT(*) FROM project_participants pp WHERE pp.sid = s.id
    ) AS student_proj_count
  FROM projects p
  JOIN students s ON (
    CAST(SUBSTRING(s.id,2) AS UNSIGNED) % 5 = CAST(SUBSTRING(p.id,2) AS UNSIGNED) % 5 -- 修正：保证每5个学生至少有1个加入项目
  )
  WHERE (
    SELECT COUNT(*) FROM project_participants pp WHERE pp.sid = s.id
  ) < 2
) t
WHERE t.rn <= 15
  AND (
    SELECT COUNT(*) FROM project_participants pp WHERE pp.pid = t.pid
  ) < 15;

-- 生成工时申报数据（2024-2025年，每个参与学生每个项目1-3条记录，最多1条PENDING，其余APPROVED/PAID/REJECTED，日期分布均匀且唯一）
INSERT INTO workload_declaration (sid, pid, date, hours, pscore, wage, status)
SELECT sid, pid, d, hours, 
  CASE WHEN st = 'PENDING' THEN NULL ELSE FLOOR(60 + RAND()*40) END, 
  NULL, st
FROM (
  SELECT 
    pp.sid, pp.pid,
    DATE_ADD('2024-01-01', INTERVAL (ROW_NUMBER() OVER (PARTITION BY pp.sid, pp.pid ORDER BY RAND()) - 1) * 30 + FLOOR(RAND()*30) DAY) AS d, -- 每条记录日期唯一且分布
    ROUND(2 + RAND()*6, 2) AS hours,
    ELT(FLOOR(1 + RAND()*4), 'PENDING', 'APPROVED', 'PAID', 'REJECTED') AS st,
    ROW_NUMBER() OVER (PARTITION BY pp.sid, pp.pid ORDER BY RAND()) AS rn
  FROM project_participants pp
  JOIN (
    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3
  ) times ON 1=1
) t
WHERE rn <= 3
  AND (
    st <> 'PENDING' OR rn = 1 -- 保证每个学生每项目最多1条PENDING
  );

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
