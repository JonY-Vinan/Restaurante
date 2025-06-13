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
import "./components/css/Navbar.css"; // Archivo CSS para los estilos

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Verificar estado de autenticación al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("user");
    return <Navigate to="/" />;
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
        {/* Redirección para la ruta mal escrita */}
        <Route path="/resgistro" element={<Navigate to="/registro" />} />
      </Routes>
    </Router>
  );
}

export default App;
