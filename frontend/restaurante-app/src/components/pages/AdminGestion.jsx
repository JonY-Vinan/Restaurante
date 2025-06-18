import React, { useState } from "react";
import UserManagement from "../management/UserManagement"; // Crea este archivo después
import MenuManagement from "../management/MenuManagement"; // Crea este archivo después
import "../css/AdminGestion.css"; // Archivo CSS para los estilos

export default function AdminGestion() {
  const [activeTab, setActiveTab] = useState("users"); // Estado para la pestaña activa

  return (
    <div className="admin-gestion-container">
      <h1 className="admin-gestion-title">Panel de Administración</h1>

      {/* Navegación por pestañas */}
      <div className="tabs-nav">
        <button
          className={activeTab === "users" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("users")}
        >
          Gestión de Usuarios
        </button>
        <button
          className={activeTab === "menu" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("menu")}
        >
          Gestión de Menú
        </button>
      </div>

      {/* Contenido de las pestañas */}
      <div className="tab-content">
        {activeTab === "users" && <UserManagement />}
        {activeTab === "menu" && <MenuManagement />}
      </div>
    </div>
  );
}
