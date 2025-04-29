from flask import Blueprint, request
from app.utils.decorators import require_admin
from app.utils.response import success, error
from app.services import admin_service

bp = Blueprint('admin', __name__)


@bp.route('/projects', methods=['POST'])
@require_admin
def create_project():
    data = request.get_json()
    try:
        new_project = admin_service.create_project(data)
        return success({'project_id': new_project.id})
    except ValueError as e:
        return error(str(e), 400)
