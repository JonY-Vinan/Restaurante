from sqlalchemy import Column, String, Integer, DateTime, Boolean, Float, Enum
from sqlalchemy.orm import declarative_base
import uuid
from datetime import datetime
from enum import Enum as PythonEnum

Base = declarative_base()

class TipoUsuario(PythonEnum):
    ADMIN = "admin"
    CLIENTE = "cliente"
    EMPLEADO = "empleado"

class UsuarioDB(Base):
    __tablename__ = 'usuario'
    
    id = Column(String(6), primary_key=True, default=lambda: uuid.uuid4().hex[:6].upper())
    nombre = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    telefono = Column(String(20))
    tipo_usuario = Column(Enum(TipoUsuario),nullable=False, default=TipoUsuario.CLIENTE)
    contrasena = Column(String(255), nullable=False)  # Cambiado de contrasena_hash


class MenuDelDiaDB(Base):
    __tablename__ = 'menu_del_dia'
    
    id = Column(String(6), primary_key=True, default=lambda: uuid.uuid4().hex[:6].upper())
    fecha = Column(DateTime, default=datetime.now, nullable=False)
    precio_base = Column(Float, nullable=False)
    platos_entrada = Column(String, nullable=False)  # Cadena con IDs separados por comas
    platos_principal = Column(String, nullable=False)
    platos_postre = Column(String, nullable=False)
    incluye = Column(String, default="pan,agua")
    notas = Column(String, default="")

    # def set_password(self, password):
    #    self.password_hash = generate_password_hash(password)
       
    # def check_password(self, password):
    #    return check_password_hash(self.password_hash, password)
    