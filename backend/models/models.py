from werkzeug.security import generate_password_hash, check_password_hash
from enum import Enum as PythonEnum
import uuid
from datetime import datetime
from extensions import db, jwt

class TipoUsuario(PythonEnum):
    ADMIN = "ADMIN"
    CLIENTE = "CLIENTE" # <--- Cambiado a mayúsculas
    EMPLEADO = "EMPLEADO"


class UsuarioDB(db.Model):
    __tablename__ = 'usuario'
    
    id = db.Column(db.String(6), primary_key=True, default=lambda: uuid.uuid4().hex[:6].upper())
    nombre = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    telefono = db.Column(db.String(20))
    tipo_usuario = db.Column(db.Enum(TipoUsuario), nullable=False, default=TipoUsuario.CLIENTE)
    password_hash = db.Column(db.String(255), nullable=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.now, nullable=False)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'email': self.email,
            'telefono': self.telefono,
            'tipo_usuario': self.tipo_usuario.value,
            'fecha_registro': self.fecha_registro.isoformat()
        }

class MenuDelDiaDB(db.Model):
    __tablename__ = 'menu_del_dia'
    
    id = db.Column(db.String(6), primary_key=True, default=lambda: uuid.uuid4().hex[:6].upper())
    fecha = db.Column(db.DateTime, default=datetime.now, nullable=False)
    precio_base = db.Column(db.Float, nullable=False)
    platos_entrada = db.Column(db.String, nullable=False)
    platos_principal = db.Column(db.String, nullable=False)
    platos_postre = db.Column(db.String, nullable=False)
    incluye = db.Column(db.String, default="pan,agua")
    notas = db.Column(db.String, default="")

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre, # O 'platos_entrada', etc. si mantienes el modelo anterior
            'descripcion': self.descripcion,
            'precio': self.precio,
            'disponible': self.disponible,
            # ... otros campos que quieras exponer
            'fecha': self.fecha.isoformat() if hasattr(self, 'fecha') else None # Si mantienes el campo fecha
        }


class MenuItemDB(db.Model): # Cambiar el nombre a algo más descriptivo si es un ítem individual
    __tablename__ = 'menu_items' # Nueva tabla
    id = db.Column(db.String(6), primary_key=True, default=lambda: uuid.uuid4().hex[:6].upper())
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String(255)) # Opcional
    precio = db.Column(db.Float, nullable=False)
    disponible = db.Column(db.Boolean, default=True)
    categoria = db.Column(db.String(50)) # Ej. "Entrada", "Principal", "Postre", "Bebida"

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'precio': self.precio,
            'disponible': self.disponible,
            'categoria': self.categoria
        }