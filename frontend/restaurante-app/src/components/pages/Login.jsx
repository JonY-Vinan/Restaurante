import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/App.css";

// Recibe `onLogin` como prop
export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    if (!formData.email || !formData.password) {
      setMessage({ text: "Email y contraseña son requeridos", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/usuarios/login",
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.access_token && response.data.usuario) {
        // Verifica response.data.usuario
        // Aquí es donde llamas a la función handleLogin de App.js
        onLogin(response.data.usuario, response.data.access_token); // <-- Envía el objeto 'usuario' y el 'token'

        setMessage({ text: "Inicio de sesión exitoso", type: "success" });

        navigate("/"); // Redirigir al home
      } else {
        setMessage({ text: "Respuesta de login inesperada", type: "error" });
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Error al iniciar sesión";
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="menu-container">
      <h1 className="menu-title">Iniciar Sesión</h1>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit} className="menu-info">
        <div className="menu-item">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="menu-item">
          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
}
