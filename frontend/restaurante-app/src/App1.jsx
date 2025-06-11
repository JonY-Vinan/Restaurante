import { useEffect, useState } from "react";
import axios from "axios";
import "./css/App.css";
function App() {
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/menu")
      .then((response) => setMenu(response.data))
      .catch((error) => console.error("Error al obtener el menú", error));
  }, []);

  return (
    <div className="menu-container">
      <h1 className="menu-title">Menú del Día</h1>
      {menu ? (
        <div className="menu-info">
          <div className="menu-item">
            <strong>Fecha:</strong>
            <span className="menu-date">
              {new Date(menu.fecha).toLocaleDateString()}
            </span>
          </div>
          <div className="menu-item">
            <strong>Precio Base:</strong>
            <span className="menu-price">€{menu.precio_base}</span>
          </div>
          <div className="menu-item">
            <strong>Entrada:</strong> {menu.entrada}
          </div>
          <div className="menu-item">
            <strong>Principal:</strong> {menu.principal}
          </div>
          <div className="menu-item">
            <strong>Postre:</strong> {menu.postre}
          </div>
          <div className="menu-item">
            <strong>Incluye:</strong> {menu.incluye}
          </div>
          {menu.notas && (
            <div className="menu-notes">
              <strong>Notas:</strong> {menu.notas}
            </div>
          )}
        </div>
      ) : (
        <p className="loading">Cargando menú...</p>
      )}
    </div>
  );
}

export default App;
