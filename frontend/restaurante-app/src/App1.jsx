// frontend/src/App.js

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./components/pages/Home";
import Menu from "./components/pages/Menu";
import MobileMenuForm from "./components/pages/MobileMenuForm";
import ResgistroUsuario from "./components/pages/RegistroUsuario";
import Login from "./components/pages/Login";
import AdminGestion from "./components/pages/AdminGestion"; // <-- Importar el nuevo componente
import "./components/css/Navbar.css";
import axios from "axios";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setIsLoggedIn(true);
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken}`;
      } catch (e) {
        console.error("App.js - useEffect: Error parseando storedUser:", e);
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["Authorization"];
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
    }
  }, []);

  const handleLogin = (userData, token) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    window.location.href = "/";
  };

  return (
    <Router>
      <nav className="navbar">
        <div className="nav-logo">
          <Link to="/">Restaurante Ohana</Link>
        </div>

        <div className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/menu">Menú</Link>

          {/* Enlace a AdminGestion - Condicionalmente mostrado para administradores (luego con lógica de rol) */}
          {isLoggedIn &&
            user?.tipo_usuario === "ADMIN" && ( // Añade esta condición para el rol de administrador
              <Link to="/admin">Administración</Link>
            )}

          {isLoggedIn ? (
            <>
              <Link to="/perfil" className="nav-profile">
                <span>{user?.nombre || "Perfil"}</span>
                <i className="fas fa-user-circle"></i>
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/registro">Registro</Link>
              <Link to="/login">Login</Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/registro" element={<ResgistroUsuario />} />
        <Route path="/mobile/menu" element={<MobileMenuForm />} />
        <Route path="/resgistro" element={<Navigate to="/registro" />} />

        {/* Ruta para el panel de administración */}
        {/* Aquí puedes añadir una protección de ruta basada en el rol si lo deseas */}
        <Route
          path="/admin"
          element={
            isLoggedIn && user?.tipo_usuario === "ADMIN" ? (
              <AdminGestion />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
