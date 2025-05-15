import requests
import time
import random
import string
import hashlib

BASE_URL = 'http://localhost:3000/api'


def random_id(prefix, length=5):
    return prefix + ''.join(random.choices(string.digits, k=length))


def print_result(label, resp):
    pass  # Remove all print statements


def test_login(role, id, password):
    hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()
    resp = requests.post(
        f'{BASE_URL}/login', json={"role": role, "id": id, "password": hashed_password})
    print_result('Login', resp)
    return resp


def test_admin_add_project(projectId, projectName, description, hourPayment, performanceRatio, budget, participants, leadingProfessor):
    resp = requests.post(f'{BASE_URL}/projects', json={
        "projectId": projectId,
        "projectName": projectName,
        "description": description,
        "hourPayment": hourPayment,
        "performanceRatio": performanceRatio,
        "budget": budget,
        "participants": participants,
        "leadingProfessor": leadingProfessor
    })
    print_result('Admin Add Project', resp)
    return resp


def test_admin_get_projects():
    resp = requests.get(f'{BASE_URL}/projects')
    print_result('Admin Get Projects', resp)
    return resp


def test_admin_update_project(projectId, hourPayment=None, participants=None, balance=None, performanceRatio=None):
    payload = {k: v for k, v in zip(['hourPayment', 'participants', 'balance', 'performanceRatio'], [
                                    hourPayment, participants, balance, performanceRatio]) if v is not None}
    resp = requests.put(f'{BASE_URL}/projects/{projectId}', json=payload)
    print_result('Admin Update Project', resp)
    return resp


def test_admin_delete_project(projectId):
    resp = requests.delete(f'{BASE_URL}/projects/{projectId}')
    print_result('Admin Delete Project', resp)
    return resp


def test_admin_annual_report(year):
    resp = requests.get(f'{BASE_URL}/annual-report', params={"year": year})
    print_result('Admin Annual Report', resp)
    return resp


def test_student_projects(sid):
    resp = requests.get(f'{BASE_URL}/student-projects/{sid}')
    print_result('Student Projects', resp)
    return resp


def test_student_wage_history(studentId, projectId):
    resp = requests.get(f'{BASE_URL}/wage-history/{studentId}',
                        params={"projectId": projectId})
    print_result('Student Wage History', resp)
    return resp


def test_student_working_hours(studentId, pid=None, newest=None, year=None, month=None):
    params = {}
    if pid:
        params['pid'] = pid
    if newest:
        params['newest'] = 'true'
    if year:
        params['year'] = year
    if month:
        params['month'] = month
    resp = requests.get(
        f'{BASE_URL}/student-working-hours/{studentId}', params=params)
    print_result('Student Working Hours', resp)
    return resp


def test_student_declare_working_hours(pid, sid, hours, date):
    resp = requests.post(f'{BASE_URL}/declare-working-hours',
                         json={"pid": pid, "sid": sid, "hours": hours, "date": date})
    print_result('Student Declare Working Hours', resp)
    return resp


def test_student_cancel_working_hours(pid, sid):
    resp = requests.delete(f'{BASE_URL}/cancel-working-hours/{pid}/{sid}')
    print_result('Student Cancel Working Hours', resp)
    return resp


def test_teacher_projects(teacherId):
    resp = requests.get(f'{BASE_URL}/teacher-projects/{teacherId}')
    print_result('Teacher Projects', resp)
    return resp


def test_teacher_project_students(projectId, month=None):
    params = {"month": month} if month else {}
    resp = requests.get(
        f'{BASE_URL}/project-students/{projectId}', params=params)
    print_result('Teacher Project Students', resp)
    return resp


def test_teacher_approve_working_hours(projectId, studentId, date, performanceScore):
    resp = requests.put(f'{BASE_URL}/project-students/approve', json={"projectId": projectId,
                        "studentId": studentId, "date": date, "performanceScore": performanceScore})
    print_result('Teacher Approve Working Hours', resp)
    return resp


def test_teacher_reject_working_hours(projectId, studentId, date):
    resp = requests.put(f'{BASE_URL}/project-students/reject',
                        json={"projectId": projectId, "studentId": studentId, "date": date})
    print_result('Teacher Reject Working Hours', resp)
    return resp


def test_teacher_wage_paid_condition(projectId, yearMonth=None):
    params = {"yearMonth": yearMonth} if yearMonth else {}
    resp = requests.get(
        f'{BASE_URL}/wage-paid-condition/{projectId}', params=params)
    print_result('Teacher Wage Paid Condition', resp)
    return resp


def test_teacher_pay_wage(projectId, studentId, date):
    resp = requests.put(f'{BASE_URL}/wage-paid',
                        json={"projectId": projectId, "studentId": studentId, "date": date})
    print_result('Teacher Pay Wage', resp)
    return resp


if __name__ == '__main__':
    test_login(2, 'A01', '123')
    test_login(1, 'T0001', '123')
    test_login(0, 'S0001', '123')

    pid = random_id('P', 4)
    sid = 'S0001'
    test_admin_add_project(pid, 'AutoTestProj', 'desc',
                           50, 1.0, 10000, [sid], 'T0001')
    test_admin_get_projects()
    test_admin_update_project(pid, hourPayment=60)
    test_admin_annual_report(2025)

    test_student_projects(sid)
    test_student_declare_working_hours(pid, sid, 8, '2025-05-15')
    test_student_working_hours(sid, pid=pid, newest=True)
    test_student_cancel_working_hours(pid, sid)

    test_teacher_projects('T0001')
    test_teacher_project_students(pid, month='2025-05')
    test_student_declare_working_hours(pid, sid, 8, '2025-05-15')
    test_teacher_approve_working_hours(pid, sid, '2025-05-15', 90)
    test_teacher_wage_paid_condition(pid, yearMonth='2025-05')
    test_teacher_pay_wage(pid, sid, '2025-05-15')
    test_student_wage_history(sid, pid)
    test_admin_delete_project(pid)

    def avg_time(func, *args, repeat=10, **kwargs):
        times = []
        for _ in range(repeat):
            t0 = time.time()
            func(*args, **kwargs)
            times.append(time.time() - t0)
        return sum(times) / len(times)

    def batch_test():
        batch = 10
        tid = 'T0001'
        admin_id = 'A01'
        admin_pwd = '123'
        teacher_pwd = '123'
        student_pwd = '123'
        def login_admin(): return test_login(2, admin_id, admin_pwd)
        def login_teacher(): return test_login(1, tid, teacher_pwd)
        def login_student(): return test_login(0, 'S0001', student_pwd)
        results = []
        results.append(("Admin login", avg_time(login_admin, repeat=batch)))
        results.append(
            ("Teacher login", avg_time(login_teacher, repeat=batch)))
        results.append(
            ("Student login", avg_time(login_student, repeat=batch)))

        def add_proj():
            pid = random_id('P')
            test_admin_add_project(pid, 'AutoTestProj',
                                   'desc', 50, 1.0, 10000, ['S0001'], tid)
        results.append(("Admin add project", avg_time(add_proj, repeat=batch)))
        results.append(("Admin get projects", avg_time(
            test_admin_get_projects, repeat=batch)))

        def update_proj():
            pid = random_id('P')
            test_admin_add_project(pid, 'AutoTestProj',
                                   'desc', 50, 1.0, 10000, ['S0001'], tid)
            test_admin_update_project(pid, hourPayment=60)
        results.append(
            ("Admin update project", avg_time(update_proj, repeat=batch)))

        def delete_proj():
            pid = random_id('P')
            test_admin_add_project(pid, 'AutoTestProj',
                                   'desc', 50, 1.0, 10000, ['S0001'], tid)
            test_admin_delete_project(pid)
        results.append(
            ("Admin delete project", avg_time(delete_proj, repeat=batch)))
        results.append(("Admin annual report", avg_time(
            lambda: test_admin_annual_report(2025), repeat=batch)))
        results.append(
            ("Student get projects", avg_time(lambda: test_student_projects('S0001'), repeat=batch)))

        def declare():
            pid = random_id('P')
            test_admin_add_project(pid, 'AutoTestProj',
                                   'desc', 50, 1.0, 10000, ['S0001'], tid)
            test_student_declare_working_hours(pid, 'S0001', 8, '2025-05-15')
        results.append(("Student declare working hours",
                       avg_time(declare, repeat=batch)))

        def cancel():
            pid = random_id('P')
            test_admin_add_project(pid, 'AutoTestProj',
                                   'desc', 50, 1.0, 10000, ['S0001'], tid)
            test_student_declare_working_hours(pid, 'S0001', 8, '2025-05-15')
            test_student_cancel_working_hours(pid, 'S0001')
        results.append(("Student cancel working hours",
                       avg_time(cancel, repeat=batch)))

        def working_hours():
            pid = random_id('P')
            test_admin_add_project(pid, 'AutoTestProj',
                                   'desc', 50, 1.0, 10000, ['S0001'], tid)
            test_student_declare_working_hours(pid, 'S0001', 8, '2025-05-15')
            test_student_working_hours('S0001', pid=pid, newest=True)
        results.append(("Student get working hours",
                       avg_time(working_hours, repeat=batch)))

        def wage_history():
            pid = random_id('P')
            test_admin_add_project(pid, 'AutoTestProj',
                                   'desc', 50, 1.0, 10000, ['S0001'], tid)
            test_student_declare_working_hours(pid, 'S0001', 8, '2025-05-15')
            test_teacher_approve_working_hours(pid, 'S0001', '2025-05-15', 90)
            test_teacher_pay_wage(pid, 'S0001', '2025-05-15')
            test_student_wage_history('S0001', pid)
        results.append(
            ("Student wage history", avg_time(wage_history, repeat=batch)))
        results.append(
            ("Teacher get projects", avg_time(lambda: test_teacher_projects(tid), repeat=batch)))

        def project_students():
            pid = random_id('P')
            test_admin_add_project(pid, 'AutoTestProj',
                                   'desc', 50, 1.0, 10000, ['S0001'], tid)
            test_teacher_project_students(pid, month='2025-05')
        results.append(("Teacher get project students",
                       avg_time(project_students, repeat=batch)))

        def approve():
            pid = random_id('P')
            test_admin_add_project(pid, 'AutoTestProj',
                                   'desc', 50, 1.0, 10000, ['S0001'], tid)
            test_student_declare_working_hours(pid, 'S0001', 8, '2025-05-15')
            test_teacher_approve_working_hours(pid, 'S0001', '2025-05-15', 90)
        results.append(("Teacher approve working hours",
                       avg_time(approve, repeat=batch)))

        def reject():
            pid = random_id('P')
            test_admin_add_project(pid, 'AutoTestProj',
                                   'desc', 50, 1.0, 10000, ['S0001'], tid)
            test_student_declare_working_hours(pid, 'S0001', 8, '2025-05-15')
            test_teacher_reject_working_hours(pid, 'S0001', '2025-05-15')
        results.append(("Teacher reject working hours",
                       avg_time(reject, repeat=batch)))

        def wage_paid_condition():
            pid = random_id('P')
            test_admin_add_project(pid, 'AutoTestProj',
                                   'desc', 50, 1.0, 10000, ['S0001'], tid)
            test_teacher_wage_paid_condition(pid, yearMonth='2025-05')
        results.append(("Teacher wage paid condition", avg_time(
            wage_paid_condition, repeat=batch)))

        def pay_wage():
            pid = random_id('P')
            test_admin_add_project(pid, 'AutoTestProj',
                                   'desc', 50, 1.0, 10000, ['S0001'], tid)
            test_student_declare_working_hours(pid, 'S0001', 8, '2025-05-15')
            test_teacher_approve_working_hours(pid, 'S0001', '2025-05-15', 90)
            test_teacher_pay_wage(pid, 'S0001', '2025-05-15')
        results.append(("Teacher pay wage", avg_time(pay_wage, repeat=batch)))
        for label, t in results:
            print(f"Average {label}: {t:.3f}s")

    batch_test()
