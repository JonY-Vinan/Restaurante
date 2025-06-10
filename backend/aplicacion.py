from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from Gestor_Restaurante import Gestor_Restaurante
from datetime import datetime
import tablas_bd
app = FastAPI(title="API Restaurante Ohana")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# tablas_bd.connectar()
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
    try:
        menu_id = gestor.crear_menu_del_dia(menu.dict())
        return {"status": "success", "id": menu_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al crear el menú")

@app.get("/menu-del-dia/", response_model=MenuDelDiaResponse)
def obtener_menu_del_dia():
    try:
        menu = gestor.obtener_menu_del_dia()
        if not menu:
            raise HTTPException(status_code=404, detail="Menú no encontrado")
        return menu
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al obtener el menú")

@app.get("/menus-del-dia/", response_model=List[MenuDelDiaResponse])
def obtener_todos_menus():
    try:
        menus = gestor.obtener_todos_menus()
        return menus
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al obtener los menús")