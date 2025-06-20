from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.exc import SQLAlchemyError
from extensions import db
from models.models import UsuarioDB
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token 
from functools import wraps
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
usuarios_bp = Blueprint('usuarios_bp', __name__)


def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request() # Verifica que haya un token JWT válido
            current_user_id = get_jwt_identity()
            user = UsuarioDB.query.get(current_user_id)

            if user and user.tipo_usuario.value == 'ADMIN': # Comprueba si el tipo_usuario es ADMIN
                return fn(*args, **kwargs)
            else:
                return jsonify({"msg": "Requiere rol de administrador"}), 403 # 403 Forbidden
        return decorator
    return wrapper

def validate_usuario_data(data, is_update=False):
    required_fields = ['nombre', 'email', 'password'] if not is_update else []
    
    if not data:
        return False, "Datos no proporcionados"
    
    for field in required_fields:
        if field not in data:
            return False, f"Campo requerido faltante: {field}"
    
    if 'email' in data and not isinstance(data['email'], str):
        return False, "Email debe ser una cadena de texto"
    
    return True, ""

@usuarios_bp.route('/usuarios', methods=['GET'])
@jwt_required()
def obtener_usuarios():
    try:
        usuarios = UsuarioDB.query.all()
        return jsonify([{
            'id': usuario.id,
            'nombre': usuario.nombre,
            'email': usuario.email,
            'tipo_usuario': usuario.tipo_usuario.value
        } for usuario in usuarios]), 200
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500

# @usuarios_bp.route('/usuarios', methods=['POST'])
# def crear_usuario():
#     try:
#         data = request.get_json()
#         valid, msg = validate_usuario_data(data)
#         if not valid:
#             return jsonify({'error': msg}), 400

#         if UsuarioDB.query.filter_by(email=data['email']).first():
#             return jsonify({'error': 'Email ya registrado'}), 400

#         usuario = UsuarioDB(
#             nombre=data['nombre'],
#             email=data['email'],
#             telefono=data.get('telefono'),
#             tipo_usuario=data.get('tipo_usuario', 'cliente')
#         )
#         usuario.set_password(data['password'])

#         db.session.add(usuario)
#         db.session.commit()

#         return jsonify({
#             'id': usuario.id,
#             'nombre': usuario.nombre,
#             'email': usuario.email,
#             'tipo_usuario': usuario.tipo_usuario.value
#         }), 201

#     except SQLAlchemyError as e:
#         db.session.rollback()
#         return jsonify({'error': str(e)}), 500

@usuarios_bp.route('/usuarios/<string:usuario_id>', methods=['PUT'])
@jwt_required()
def actualizar_usuario(usuario_id):
    try:
        data = request.get_json()
        valid, msg = validate_usuario_data(data, is_update=True)
        if not valid:
            return jsonify({'error': msg}), 400

        usuario = UsuarioDB.query.get(usuario_id)
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        if 'nombre' in data:
            usuario.nombre = data['nombre']
        if 'email' in data:
            usuario.email = data['email']
        if 'telefono' in data:
            usuario.telefono = data['telefono']
        if 'tipo_usuario' in data:
            usuario.tipo_usuario = data['tipo_usuario']
        if 'password' in data:
            usuario.set_password(data['password'])

        db.session.commit()

        return jsonify({
            'id': usuario.id,
            'nombre': usuario.nombre,
            'email': usuario.email,
            'tipo_usuario': usuario.tipo_usuario.value
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@usuarios_bp.route('/usuarios/login', methods=['POST'])
def login_ususaio():
    try:
        data = request.get_json()
        if not data or not all(key in data for key in ['email', 'password']):
            return jsonify({'error': 'Email y contraseña requeridos'}), 400
 
        usuario = UsuarioDB.query.filter_by(email=data['email']).first()
        if not usuario:
            return jsonify({'error': 'Credenciales inválidas'}), 401

        if not usuario.check_password(data['password']):
            return jsonify({'error': 'Credenciales inválidas'}), 401
        access_token = create_access_token(identity=str(usuario.id))
        return jsonify({
            'access_token': access_token,
            'usuario': {                 # <-- ¡Esta clave debe ser 'usuario' (minúsculas)!
                'id': usuario.id,
                'nombre': usuario.nombre,
                'email': usuario.email,
                'tipo_usuario': usuario.tipo_usuario.value
            }
        }), 200

    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500

@usuarios_bp.route('/usuarios', methods=['POST'])
def crear_usuario():
    try:
        data = request.get_json()
        valid, msg = validate_usuario_data(data)
        if not valid:
            return jsonify({'error': msg}), 400

        # Validación adicional de contraseña
        if len(data['password']) < 6:
            return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400

        if UsuarioDB.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email ya registrado'}), 400

        usuario = UsuarioDB(
            nombre=data['nombre'],
            email=data['email'],
            telefono=data.get('telefono'),
            tipo_usuario=data.get('tipo_usuario', 'CLIENTE')
        )
        usuario.set_password(data['password'])

        db.session.add(usuario)
        db.session.commit()

        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'user': {
                'id': usuario.id,
                'nombre': usuario.nombre,
                'email': usuario.email,
                'tipo_usuario': usuario.tipo_usuario.value
            }
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500