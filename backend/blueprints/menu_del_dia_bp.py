from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.exc import SQLAlchemyError
from extensions import db
from models.models import MenuDelDiaDB

menu_del_dia_bp = Blueprint('menu_del_dia_bp', __name__)

@menu_del_dia_bp.route('/menu-del-dia', methods=['GET'])
def obtener_menu_del_dia():
    try:
        menu = MenuDelDiaDB.query.order_by(MenuDelDiaDB.fecha.desc()).first()
        if not menu:
            return jsonify({'error': 'No hay menú disponible'}), 404
            
        return jsonify({
            'id': menu.id,
            'fecha': menu.fecha.isoformat(),
            'precio_base': menu.precio_base,
            'entrada': menu.platos_entrada,
            'principal': menu.platos_principal,
            'postre': menu.platos_postre,
            'incluye': menu.incluye,
            'notas': menu.notas
        }), 200
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500

@menu_del_dia_bp.route('/menu-del-dia', methods=['POST'])
@jwt_required()
def crear_menu_del_dia():
    try:
        data = request.get_json()
        required_fields = ['precio_base', 'entrada', 'principal', 'postre']
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Faltan campos requeridos'}), 400

        menu = MenuDelDiaDB(
            precio_base=data['precio_base'],
            platos_entrada=data['entrada'],
            platos_principal=data['principal'],
            platos_postre=data['postre'],
            incluye=data.get('incluye', 'pan,agua'),
            notas=data.get('notas', '')
        )

        db.session.add(menu)
        db.session.commit()

        return jsonify({
            'id': menu.id,
            'fecha': menu.fecha.isoformat(),
            'precio_base': menu.precio_base,
            'entrada': menu.platos_entrada,
            'principal': menu.platos_principal,
            'postre': menu.platos_postre
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500