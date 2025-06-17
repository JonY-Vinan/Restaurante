from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity,
    get_jwt
)
# Cambia estas líneas:
from extensions import db, jwt
from models import UsuarioDB
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

# Lista negra de tokens revocados (en producción usar Redis)
BLACKLIST = set()

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Validaciones básicas
    required_fields = ['nombre', 'email', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Nombre, email y contraseña son requeridos'}), 400

    if UsuarioDB.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email ya registrado'}), 400

    # Crear nuevo usuario según el modelo UsuarioDB
    try:
        usuario = UsuarioDB(
            nombre=data['nombre'],
            email=data['email'],
            telefono=data.get('telefono', ''),
            tipo_usuario=data.get('tipo_usuario', 'cliente')
        )
        usuario.set_password(data['password'])

        db.session.add(usuario)
        db.session.commit()

        # Crear token JWT
        access_token = create_access_token(identity=str(usuario.id))

        return jsonify({
            'mensaje': 'Usuario creado exitosamente',
            'access_token': access_token,
            'usuario': {
                'id': usuario.id,
                'nombre': usuario.nombre,
                'email': usuario.email,
                'tipo_usuario': usuario.tipo_usuario.value
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data.get('email'):
        return jsonify({'error': 'Email requerido'}), 400

    if not data.get('password'):
        return jsonify({'error': 'Contraseña requerida'}), 400

    # Buscar usuario por email
    usuario = UsuarioDB.query.filter_by(email=data['email']).first()

    if not usuario or not usuario.check_password(data['password']):
        return jsonify({'error': 'Credenciales inválidas'}), 401

    # Actualizar último acceso (necesitarías agregar este campo al modelo si lo quieres)
    # usuario.ultimo_acceso = datetime.now(tz=timezone.utc)
    # db.session.commit()

    # Crear token JWT
    access_token = create_access_token(identity=str(usuario.id))

    return jsonify({
        'access_token': access_token,
        'usuario': {
            'id': usuario.id,
            'nombre': usuario.nombre,
            'email': usuario.email,
            'tipo_usuario': usuario.tipo_usuario.value
        }
    })

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti'] 
    BLACKLIST.add(jti)
    return jsonify({'mensaje': 'Sesión cerrada exitosamente'})

# Middleware de protección
@jwt.token_in_blocklist_loader
def check_if_token_in_blacklist(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    return jti in BLACKLIST

# Endpoint protegido de ejemplo
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    usuario = UsuarioDB.query.get(current_user_id)
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    return jsonify({
        'id': usuario.id,
        'nombre': usuario.nombre,
        'email': usuario.email,
        'tipo_usuario': usuario.tipo_usuario.value,
        'fecha_registro': usuario.fecha_registro.isoformat()
    })