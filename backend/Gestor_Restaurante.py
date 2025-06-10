from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from tablas_bd import MenuDelDiaDB
import uuid
from datetime import datetime
from typing import Dict, List

class Gestor_Restaurante:
    def __init__(self, connection_string="postgresql://postgres:pass@localhost:5432/restaurante"):
        print("Conectando a la base de datos...")
        try:
            self.engine = create_engine(connection_string)
            Session = sessionmaker(bind=self.engine)
            self.session = Session()
        except Exception as e:
            print(f"❌ Error al conectar a la base de datos: {e}")
            raise

    def __del__(self):
        if hasattr(self, 'session'):
            self.session.close()

    def crear_menu_del_dia(self, datos_menu: Dict):
        try:
            # Validar que los campos requeridos estén presentes
            required_fields = ['precio_base', 'platos_entrada', 'platos_principal', 'platos_postre']
            for field in required_fields:
                if field not in datos_menu:
                    raise ValueError(f"Campo requerido faltante: {field}")

            menu = MenuDelDiaDB(
                precio_base=datos_menu['precio_base'],
                platos_entrada=datos_menu['platos_entrada'],
                platos_principal=datos_menu['platos_principal'],
                platos_postre=datos_menu['platos_postre'],
                incluye=datos_menu.get('incluye', 'pan,agua'),
                notas=datos_menu.get('notas', '')
            )
            self.session.add(menu)
            self.session.commit()
            return menu.id
        except Exception as e:
            self.session.rollback()
            raise

    def obtener_menu_del_dia(self):
        try:
            # Obtener el menú más reciente
            menu = self.session.query(MenuDelDiaDB)\
                .order_by(MenuDelDiaDB.fecha.desc())\
                .first()
            return menu
        except Exception as e:
            raise

    def obtener_todos_menus(self):
        try:
            return self.session.query(MenuDelDiaDB)\
                .order_by(MenuDelDiaDB.fecha.desc())\
                .all()
        except Exception as e:
            raise