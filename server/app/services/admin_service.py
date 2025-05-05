from app.database import db_interface


def create_project(project_data):
    # 验证预算是否合法
    if project_data.get('budget', 0) <= 0:
        raise ValueError("Invalid budget amount")

    # 调用数据库接口
    return db_interface.create_project(project_data)
