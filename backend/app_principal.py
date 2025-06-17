from flask import Flask
from extensions import db, migrate
from extensions import bcrypt, jwt
from blueprints.usuarios_dp import usuarios_bp
from blueprints.auth import auth_bp
from flask_cors import CORS 
def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Initialize CORS
    CORS(app) # <--- Add this line, usually before initializing other extensions
              # You can also specify origins: CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
              # For development, CORS(app) is generally fine to allow all origins.

    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Importar modelos
    from models import UsuarioDB, MenuDelDiaDB # Make sure these are your actual model names

    # Registrar blueprints
    app.register_blueprint(usuarios_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True)