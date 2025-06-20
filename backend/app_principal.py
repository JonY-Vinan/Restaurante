# app_principal.py o app.py (tu archivo principal de la aplicación Flask)

from flask import Flask
from extensions import db, jwt # Asegúrate de que db y jwt estén importados desde 'extensions.py'
from blueprints.usuarios_dp import usuarios_bp
from blueprints.menu_del_dia_bp import menu_del_dia_bp # Asegúrate de importar tu blueprint de menú si tienes uno
from models.models import UsuarioDB, TipoUsuario # Importa tu modelo UsuarioDB y TipoUsuario
from werkzeug.security import generate_password_hash # Necesitas esto para hashear la contraseña del admin
import uuid
def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config') # Carga tu configuración desde config.py

    db.init_app(app)
    jwt.init_app(app)

    # Registrar Blueprints
    app.register_blueprint(usuarios_bp, url_prefix='/api')
    app.register_blueprint(menu_del_dia_bp, url_prefix='/api') # Si tienes un blueprint de menú

    # Contexto de aplicación para operaciones de base de datos
    with app.app_context():
        db.create_all() # Crea todas las tablas si no existen

        # --- Lógica para crear el usuario administrador ---
        # Definir las credenciales del usuario admin
        admin_email = "admin@restauranteohana.com" # O el email que prefieras para tu admin
        admin_password = "admin" # La contraseña plana
        admin_name = "Administrador Principal"
        admin_phone = "123456789" # Opcional

        # Verificar si el usuario admin ya existe
        existing_admin = UsuarioDB.query.filter_by(email=admin_email).first()

        if not existing_admin:
            # Si no existe, crearlo
            new_admin = UsuarioDB(
                id=uuid.uuid4().hex[:6].upper(), # Genera un ID único como lo haces en el modelo
                nombre=admin_name,
                email=admin_email,
                telefono=admin_phone,
                tipo_usuario=TipoUsuario.ADMIN # Asigna el tipo de usuario ADMIN
            )
            new_admin.set_password(admin_password) # Hashea y guarda la contraseña

            db.session.add(new_admin)
            db.session.commit()
            print(f"Usuario administrador '{admin_email}' creado con éxito.")
        else:
            print(f"Usuario administrador '{admin_email}' ya existe.")
        # --- Fin de la lógica para crear el usuario administrador ---

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)

# Exporta la aplicación para Gunicorn
# app = create_app() # Esta línea es lo que Gunicorn buscará