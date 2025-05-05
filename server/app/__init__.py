from flask import Flask
from .routes import auth, admin, teacher, student
from .utils.config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 注册蓝图
    app.register_blueprint(auth.bp)
    app.register_blueprint(admin.bp, url_prefix='/admin')
    app.register_blueprint(teacher.bp, url_prefix='/teacher')
    app.register_blueprint(student.bp, url_prefix='/student')

    return app
