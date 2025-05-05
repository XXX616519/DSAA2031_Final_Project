from functools import wraps
from flask import request, jsonify
from app.utils.response import error


def require_role(role):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # 这里需要实现实际的权限验证逻辑
            user = getattr(request, 'current_user', None)
            if not user or user.role != role:
                return error("Unauthorized", 403)
            return f(*args, **kwargs)
        return wrapped
    return decorator


require_admin = require_role('admin')
require_teacher = require_role('teacher')
require_student = require_role('student')
