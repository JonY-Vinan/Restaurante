# Base de datos
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
# Encriptación y JWT
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt

# Inicializar extensiones
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()