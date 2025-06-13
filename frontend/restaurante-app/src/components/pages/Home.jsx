import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Home.css";

function Home() {
  const [menuDelDia, setMenuDelDia] = useState(null);
  const [reservasAbiertas, setReservasAbiertas] = useState(true);
  const [platosDestacados, setPlatosDestacados] = useState([]);
  const navigate = useNavigate();

  // Simular carga de datos
  useEffect(() => {
    // Datos del menú del día (podrías reemplazar con una llamada API)
    setMenuDelDia({
      entrada: "Ensalada César",
      principal: "Lomo de Res con salsa de hongos",
      postre: "Tiramisú",
      precio: 25.99,
      horario: "12:00 - 16:00",
    });

    // Platos destacados
    setPlatosDestacados([
      {
        id: 1,
        nombre: "Paella Valenciana",
        precio: 18.5,
        categoria: "Mariscos",
      },
      {
        id: 2,
        nombre: "Risotto de Champiñones",
        precio: 15.75,
        categoria: "Vegetariano",
      },
      { id: 3, nombre: "Cordero al Romero", precio: 22.9, categoria: "Carnes" },
    ]);

    // Simular horario de reservas
    const horaActual = new Date().getHours();
    setReservasAbiertas(horaActual >= 9 && horaActual < 22);
  }, []);

  const handleReservaClick = () => {
    navigate("/reservas");
  };

  const handleVerMenuCompleto = () => {
    navigate("/menu");
  };

  return (
    <div className="restaurante-container">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>Bienvenido a Restaurante Ohana</h1>
          <p>Experiencia gastronómica única desde 1995</p>
          <button
            className="reserva-btn"
            onClick={handleReservaClick}
            disabled={!reservasAbiertas}
          >
            {reservasAbiertas ? "Reservar Mesa" : "Reservas Cerradas"}
          </button>
        </div>
      </section>

      {/* Menú del día */}
      <section className="menu-section">
        <h2>Menú del Día</h2>
        {menuDelDia ? (
          <div className="menu-card">
            <div className="menu-item">
              <h3>Entrada</h3>
              <p>{menuDelDia.entrada}</p>
            </div>
            <div className="menu-item">
              <h3>Plato Principal</h3>
              <p>{menuDelDia.principal}</p>
            </div>
            <div className="menu-item">
              <h3>Postre</h3>
              <p>{menuDelDia.postre}</p>
            </div>
            <div className="menu-footer">
              <span>Precio: ${menuDelDia.precio}</span>
              <span>Horario: {menuDelDia.horario}</span>
            </div>
            <button className="ver-menu-btn" onClick={handleVerMenuCompleto}>
              Ver Menú Completo
            </button>
          </div>
        ) : (
          <p>Cargando menú...</p>
        )}
      </section>

      {/* Platos destacados */}
      <section className="destacados-section">
        <h2>Nuestros Platos Estrella</h2>
        <div className="platos-grid">
          {platosDestacados.map((plato) => (
            <div key={plato.id} className="plato-card">
              <h3>{plato.nombre}</h3>
              <p className="categoria">{plato.categoria}</p>
              <p className="precio">${plato.precio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Horario */}
      <section className="horario-section">
        <h2>Horario de Atención</h2>
        <div className="horario-container">
          <div className="dia">
            <p>Lunes - Viernes</p>
            <p>12:00 - 23:00</p>
          </div>
          <div className="dia">
            <p>Sábado - Domingo</p>
            <p>11:00 - 24:00</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
