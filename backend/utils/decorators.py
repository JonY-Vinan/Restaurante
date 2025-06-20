# utils/decorators.py

from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from models.models import UsuarioDB # Asegúrate de que esta importación sea correcta

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request() # Verifica que haya un token JWT válido
            current_user_id = get_jwt_identity()
            user = UsuarioDB.query.get(current_user_id)

            if user and user.tipo_usuario.value == 'ADMIN':
                return fn(*args, **kwargs)
            else:
                return jsonify({"msg": "Acceso denegado: Se requiere rol de administrador"}), 403
        return decorator
    return wrapper