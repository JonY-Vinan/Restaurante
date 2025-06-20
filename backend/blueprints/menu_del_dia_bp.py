from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity # Importa get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from ..extensions import db
from ..models.models import MenuDelDiaDB, UsuarioDB # Importa UsuarioDB para el decorador
from utils.decorators import admin_required # Asumiendo que admin_required está aquí

menu_del_dia_bp = Blueprint('menu_del_dia_bp', __name__)

# --- GET (Obtener todos los ítems del menú) ---
@menu_del_dia_bp.route('/menu', methods=['GET'])
# Puedes decidir si esta ruta necesita estar protegida o no.
# Si el menú es público, no necesitas @jwt_required().
# Si solo los admins pueden ver la lista completa, añade @admin_required().
def obtener_todos_los_items_menu():
    try:
        # Recupera todos los elementos del menú, ordenados por fecha descendente
        # Esto podría ser una lista larga, considera paginación para aplicaciones grandes
        menu_items = MenuDelDiaDB.query.order_by(MenuDelDiaDB.fecha.desc()).all()
        
        if not menu_items:
            return jsonify([]), 200 # Devolver una lista vacía si no hay ítems

        # Convierte los objetos a diccionarios para la respuesta JSON
        return jsonify([item.to_dict() for item in menu_items]), 200
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500

# --- GET (Obtener un ítem del menú por ID) ---
@menu_del_dia_bp.route('/menu/<string:item_id>', methods=['GET'])
# Decide si esta ruta debe estar protegida para ver detalles de un ítem específico
def obtener_item_menu_por_id(item_id):
    try:
        menu_item = MenuDelDiaDB.query.get(item_id)
        if not menu_item:
            return jsonify({'error': 'Ítem del menú no encontrado'}), 404
        
        return jsonify(menu_item.to_dict()), 200
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500

# --- POST (Crear un nuevo menú del día) ---
@menu_del_dia_bp.route('/menu', methods=['POST'])
@jwt_required()
@admin_required() # Solo administradores pueden crear ítems del menú
def crear_menu_del_dia():
    try:
        data = request.get_json()
        required_fields = ['nombre', 'precio', 'disponible'] # Ajusta según tu MenuDelDiaDB actual
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Faltan campos requeridos: nombre, precio, disponible'}), 400

        # Crea el nuevo objeto MenuDelDiaDB
        menu_item = MenuDelDiaDB(
            nombre=data['nombre'],
            descripcion=data.get('descripcion', ''), # Puedes permitir descripción opcional
            precio=data['precio'],
            disponible=data.get('disponible', True) # Valor por defecto
        )

        db.session.add(menu_item)
        db.session.commit()

        return jsonify(menu_item.to_dict()), 201 # Retorna el objeto creado
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': f"Error inesperado: {str(e)}"}), 500


# --- PUT (Actualizar un ítem del menú existente) ---
@menu_del_dia_bp.route('/menu/<string:item_id>', methods=['PUT'])
@jwt_required()
@admin_required() # Solo administradores pueden actualizar ítems del menú
def actualizar_menu_del_dia(item_id):
    try:
        menu_item = MenuDelDiaDB.query.get(item_id)
        if not menu_item:
            return jsonify({'error': 'Ítem del menú no encontrado'}), 404

        data = request.get_json()

        # Actualiza los campos solo si están presentes en la solicitud
        if 'nombre' in data:
            menu_item.nombre = data['nombre']
        if 'descripcion' in data:
            menu_item.descripcion = data['descripcion']
        if 'precio' in data:
            menu_item.precio = data['precio']
        if 'disponible' in data:
            menu_item.disponible = data['disponible']
        
        # Agrega campos específicos de tu modelo MenuDelDiaDB si los quieres actualizar
        # Ejemplo:
        # if 'platos_entrada' in data:
        #    menu_item.platos_entrada = data['platos_entrada']
        # if 'platos_principal' in data:
        #    menu_item.platos_principal = data['platos_principal']
        # if 'platos_postre' in data:
        #    menu_item.platos_postre = data['platos_postre']
        # if 'incluye' in data:
        #    menu_item.incluye = data['incluye']
        # if 'notas' in data:
        #    menu_item.notas = data['notas']

        db.session.commit()
        return jsonify(menu_item.to_dict()), 200 # Retorna el objeto actualizado
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': f"Error inesperado: {str(e)}"}), 500

# --- DELETE (Eliminar un ítem del menú) ---
@menu_del_dia_bp.route('/menu/<string:item_id>', methods=['DELETE'])
@jwt_required()
@admin_required() # Solo administradores pueden eliminar ítems del menú
def eliminar_menu_del_dia(item_id):
    try:
        menu_item = MenuDelDiaDB.query.get(item_id)
        if not menu_item:
            return jsonify({'error': 'Ítem del menú no encontrado'}), 404

        db.session.delete(menu_item)
        db.session.commit()
        return jsonify({'message': 'Ítem del menú eliminado exitosamente'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': f"Error inesperado: {str(e)}"}), 500