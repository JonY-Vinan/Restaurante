from sqlalchemy import Column, String, Integer, DateTime, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship
import uuid
from datetime import datetime, timedelta

Base = declarative_base()

def connectar():
    try:
        from sqlalchemy import create_engine
        engine = create_engine('postgresql://postgres:1234@localhost:5432/restaurante-ohana-db')
        Base.metadata.drop_all(engine)
        Base.metadata.create_all(engine)
        print("Tablas creadas")
        conexion = engine.connect()
        print("✅ Conexión exitosa a la base de datos")
        return conexion
    except Exception as error:
        print("❌ Error al conectar a la base de datos:", error)
        return None

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

connectar()

