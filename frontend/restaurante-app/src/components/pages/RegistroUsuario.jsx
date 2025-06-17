import { useState } from "react";
import axios from "axios";
import "../css/App.css";

export default function RegistroUsuario() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

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

    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: "Las contraseñas no coinciden", type: "error" });
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage({
        text: "La contraseña debe tener al menos 6 caracteres",
        type: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const userData = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        password: formData.password,
      };

      const response = await axios.post(
        "http://localhost:5000/api/usuarios", // Cambiado de /api/registro a /usuarios
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.error) {
        setMessage({ text: response.data.error, type: "error" });
      } else {
        setMessage({
          text: response.data.message || "Usuario registrado exitosamente",
          type: "success",
        });
        // Limpiar formulario después de registro exitoso
        setFormData({
          nombre: "",
          email: "",
          telefono: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      let errorMsg = "Error desconocido.";
      if (error.response) {
        // El servidor respondió con un estado fuera del rango 2xx
        errorMsg = error.response.data.error || "Error del servidor.";
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta (ej. servidor caído)
        errorMsg =
          "No se pudo conectar al servidor. Intenta de nuevo más tarde.";
      } else {
        // Algo más que no fue un error de respuesta ni de petición
        errorMsg = error.message;
      }
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="menu-container">
      <h1 className="menu-title">Registro de Usuario</h1>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit} className="menu-info">
        <div className="menu-item">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

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
          <label>Teléfono:</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
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

        <div className="menu-item">
          <label>Confirmar Contraseña:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
}
