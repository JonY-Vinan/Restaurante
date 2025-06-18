# app_principal.py o app.py

from flask import Flask
from extensions import db, jwt
from blueprints.usuarios_dp import usuarios_bp
from blueprints.menu_del_dia_bp import menu_del_dia_bp # Si tienes un blueprint de menú
from models.models import UsuarioDB, TipoUsuario
from werkzeug.security import generate_password_hash
from flask_cors import CORS # <--- ¡Importa Flask-CORS!
import uuid
def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}) # <--- ¡Configura CORS aquí!

    # Registrar Blueprints
    app.register_blueprint(usuarios_bp, url_prefix='/api')
    app.register_blueprint(menu_del_dia_bp, url_prefix='/api')

    # Contexto de aplicación para operaciones de base de datos
    with app.app_context():
        db.create_all()

        admin_email = "admin@restauranteohana.com"
        admin_password = "admin"
        admin_name = "Administrador Principal"
        admin_phone = "123456789"

        existing_admin = UsuarioDB.query.filter_by(email=admin_email).first()

        if not existing_admin:
            new_admin = UsuarioDB(
                id=str(uuid.uuid4().hex[:6]).upper(),
                nombre=admin_name,
                email=admin_email,
                telefono=admin_phone,
                tipo_usuario=TipoUsuario.ADMIN
            )
            new_admin.set_password(admin_password)

            db.session.add(new_admin)
            db.session.commit()
            print(f"Usuario administrador '{admin_email}' creado con éxito.")
        else:
            print(f"Usuario administrador '{admin_email}' ya existe.")

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)