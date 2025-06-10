from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from Gestor_Restaurante import Gestor_Restaurante
from datetime import datetime
import tablas_bd

app = FastAPI(title="API Restaurante Ohana")

# Configuración CORS
# Es fundamental para permitir que tu frontend (ej. React) acceda a esta API.
app.add_middleware(
    CORSMiddleware,
    # En producción, reemplaza con tus dominios específicos.
    # Por ejemplo, si tu frontend corre en http://192.168.8.112:5173, inclúyelo aquí.
    allow_origins=[
        "http://localhost:5173",          # Origen para desarrollo local del frontend
        "http://192.168.8.112:5173",      # Origen si tu frontend se accede vía esta IP
        # Puedes añadir más orígenes específicos si tu frontend se despliega en otros dominios
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Permite todos los encabezados
)

# tablas_bd.connectar() # Asegúrate de que esta línea esté descomentada si necesitas conectar a la BD al iniciar la app
gestor = Gestor_Restaurante()

# Modelos Pydantic
class MenuDelDiaCreate(BaseModel):
    precio_base: float
    platos_entrada: str
    platos_principal: str
    platos_postre: str
    incluye: Optional[str] = "pan,agua"
    notas: Optional[str] = ""

class MenuDelDiaResponse(BaseModel):
    id: str
    fecha: datetime
    precio_base: float
    platos_entrada: str
    platos_principal: str
    platos_postre: str
    incluye: str
    notas: str

# Endpoints
@app.post("/menu-del-dia/", response_model=dict)
def crear_menu_del_dia(menu: MenuDelDiaCreate):
    """
    Crea un nuevo menú del día en la base de datos.
    """
    try:
        # Asegúrate de que gestor.crear_menu_del_dia espera un diccionario
        menu_id = gestor.crear_menu_del_dia(menu.model_dump()) # Usar .model_dump() para Pydantic v2
        return {"status": "success", "id": menu_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno al crear el menú: {e}")

@app.get("/menu-del-dia/", response_model=MenuDelDiaResponse)
def obtener_menu_del_dia():
    """
    Obtiene el menú del día actual (o el más reciente, dependiendo de la lógica de Gestor_Restaurante).
    """
    try:
        menu = gestor.obtener_menu_del_dia()
        if not menu:
            raise HTTPException(status_code=404, detail="Menú no encontrado para la fecha actual.")
        return menu
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno al obtener el menú: {e}")

@app.get("/menus-del-dia/", response_model=List[MenuDelDiaResponse])
def obtener_todos_menus():
    """
    Obtiene una lista de todos los menús del día registrados.
    """
    try:
        menus = gestor.obtener_todos_menus()
        return menus
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno al obtener los menús: {e}")