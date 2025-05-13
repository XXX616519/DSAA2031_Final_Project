-- 插入学生数据
INSERT INTO students (id, name, password) VALUES
('S001', '张三', 'password123'),
('S002', '李四', 'password123'),
('S003', '王五', 'password123'),
('S004', '赵六', 'password123'),
('S005', '陈七', 'password123');

-- 插入教师数据
INSERT INTO teachers (id, name, password) VALUES
('T001', '王老师', 'password123'),
('T002', '李老师', 'password123'),
('T003', '张教授', 'password123');

-- 插入管理员数据
INSERT INTO admins (id, name, password) VALUES
('A001', '系统管理员', 'admin123'),
('A002', '财务管理员', 'admin123');

-- 插入项目数据（假设预算充足，balance 初始为0）
INSERT INTO projects (id, name, description, x_coefficient, hour_payment, budget, balance, tid, start_date) VALUES
('P001', '人工智能研究', '探索AI算法优化', 1.2, 50.00, 100000.00, 0.00, 'T001', '2023-01-01'),
('P002', '量子计算实验', '量子比特稳定性分析', 1.0, 80.00, 80000.00, 0.00, 'T002', '2023-06-01'),
('P003', '生物信息学', '基因序列比对研究', 0.8, 60.00, 50000.00, 0.00, 'T003', '2023-09-01');

-- 项目参与者关联
INSERT INTO project_participants (pid, sid) VALUES
('P001', 'S001'),
('P001', 'S002'),
('P002', 'S003'),
('P003', 'S004'),
('P003', 'S005');

-- 工时提交记录（工资字段通过 hour_payment * x_coefficient * hours 计算）
INSERT INTO workload_declaration (sid, pid, date, hours, pscore, wage, status) VALUES
('S001', 'P001', '2023-10-01', 5.0, 85, 5.0 * 50 * 1.2, 'APPROVED'),
('S001', 'P001', '2023-10-02', 3.5, 90, 3.5 * 50 * 1.2, 'PAYED'),
('S002', 'P001', '2023-10-01', 4.0, 78, 4.0 * 50 * 1.2, 'PENDING'),
('S003', 'P002', '2023-10-05', 6.0, 88, 6.0 * 80 * 1.0, 'APPROVED'),
('S004', 'P003', '2023-10-10', 2.5, 92, 2.5 * 60 * 0.8, 'REJECTED');

-- 工资发放历史（仅插入已支付的记录）
INSERT INTO wage_payments (sid, pid, date, hours, pscore, hourp, prate) VALUES
('S001', 'P001', '2023-10-02', 3.5, 90, 50.00, 1.2);

-- 年报表数据（示例2023年部分统计）
INSERT INTO annual_reports (year, studentId, studentName, totalWage, averageScore) VALUES
(2023, 'S001', '张三', (5.0 * 50 * 1.2) + (3.5 * 50 * 1.2), (85 + 90)/2.0),
(2023, 'S003', '王五', 6.0 * 80 * 1.0, 88.0);