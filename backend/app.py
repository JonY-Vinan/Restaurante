from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from tablas_bd import MenuDelDiaDB, UsuarioDB, Base

# Configuración base
DATABASE_URL = "postgresql://postgres:1234@localhost:5432/restaurante-ohana-db"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

app = Flask(__name__)
CORS(app)

def inicializar_bd():
    inspector = inspect(engine)
    tablas_existentes = inspector.get_table_names()
    tablas_requeridas = ['menu_del_dia', 'usuario']
    
    if any(tabla not in tablas_existentes for tabla in tablas_requeridas):
        print("Creando tablas...")
        Base.metadata.create_all(engine)
        print("Tablas creadas")

inicializar_bd()

@app.route("/api/registro", methods=["POST", "OPTIONS"])
def crear_usuario():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    data = request.get_json()
    
    if not data or not all(key in data for key in ['nombre', 'email', 'password']):
        return jsonify({"error": "Faltan campos requeridos"}), 400
    
    session = Session()
    try:
        if session.query(UsuarioDB).filter_by(email=data['email']).first():
            return jsonify({"error": "El email ya está registrado"}), 400
            
        nuevo_usuario = UsuarioDB(
            nombre=data['nombre'],
            email=data['email'],
            telefono=data.get('telefono', ''),
            contrasena=data['password']  # Almacena directamente
        )
        
        session.add(nuevo_usuario)
        session.commit()
        
        return jsonify({
            "status": "success",
            "id": nuevo_usuario.id,
            "message": "Usuario registrado"
        }), 201
        
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()
@app.route("/api/menu", methods=["GET"])
def obtener_menu():
    session = Session()
    resultado = session.query(MenuDelDiaDB).order_by(MenuDelDiaDB.fecha.desc()).first()
    if resultado:
        return jsonify({
            "id": resultado.id,
            "fecha": resultado.fecha.isoformat(),
            "precio_base": resultado.precio_base,
            "entrada": resultado.platos_entrada,
            "principal": resultado.platos_principal,
            "postre": resultado.platos_postre,
            "incluye": resultado.incluye,
            "notas": resultado.notas
        })
    return jsonify({"error": "No hay menú disponible"}), 404



if __name__ == "__main__":
    app.run(debug=True)