# 需要数据库组实现的具体方法
class DBInterface:
    # 用户认证相关
    def get_user_by_credentials(self, username, password):
        raise NotImplementedError

    # 项目管理接口
    def create_project(self, project_data):
        raise NotImplementedError

    def update_project(self, project_id, update_data):
        raise NotImplementedError

    # 学生管理接口
    def add_student_to_project(self, project_id, student_id):
        raise NotImplementedError

    # 工资计算接口
    def calculate_wage(self, project_id, student_id):
        """
        返回工资结构示例：
        {
            "base_rate": 50.0,
            "hours": 40,
            "performance": 4.5,
            "total": (50 * 40) * (4.5/5)
        }
        """
        raise NotImplementedError

    # 以下接口定义需要根据实际需求继续扩展...
    # 例如：获取项目列表、获取学生列表、获取工资记录等
