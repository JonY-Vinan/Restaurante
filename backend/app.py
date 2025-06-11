from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from tablas_bd import MenuDelDiaDB

# Configuración base
DATABASE_URL = "postgresql://postgres:1234@localhost:5432/restaurante-ohana-db"
# engine = create_engine(DATABASE_URL)
# Session = sessionmaker(bind=engine)

app = Flask(__name__)
CORS(app)  # Permitir peticiones desde React

# Ruta para obtener el menú del día
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
