from flask import jsonify


def success(data=None, message="Success"):
    return jsonify({
        "status": "success",
        "message": message,
        "data": data
    }), 200


def error(message="Error", code=400):
    return jsonify({
        "status": "error",
        "message": message,
        "data": None
    }), code
