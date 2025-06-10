import { useState } from "react";
import axios from "axios";

export default function MobileMenuForm() {
  const [formData, setFormData] = useState({
    precio_base: "",
    platos_entrada: "",
    platos_principal: "",
    platos_postre: "",
    incluye: "pan,agua",
    notas: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // eslint-disable-next-line no-unused-vars
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
    setMessage("");
    setError("");
    setLoading(true);

    try {
      // Validación mejorada
      if (!formData.precio_base || isNaN(formData.precio_base)) {
        throw new Error("Precio base debe ser un número válido");
      }
      if (
        !formData.platos_entrada ||
        !formData.platos_principal ||
        !formData.platos_postre
      ) {
        throw new Error("Todos los campos de platos son obligatorios");
      }

      // Usar URL relativa o variable de entorno
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const response = await axios.post(
        `${apiUrl}/menu-del-dia/`,
        {
          precio_base: parseFloat(formData.precio_base),
          platos_entrada: formData.platos_entrada,
          platos_principal: formData.platos_principal,
          platos_postre: formData.platos_postre,
          incluye: formData.incluye,
          notas: formData.notas,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(`✅ Menú creado exitosamente (ID: ${response.data.id})`);
      setFormData({
        precio_base: "",
        platos_entrada: "",
        platos_principal: "",
        platos_postre: "",
        incluye: "pan,agua",
        notas: "",
      });
    } catch (err) {
      console.error("Error al crear menú:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Error al conectar con el servidor"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ padding: "1rem", maxWidth: "100%", fontFamily: "sans-serif" }}
    >
      <h2>Crear Menú del Día</h2>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input
          type="number"
          name="precio_base"
          placeholder="Precio base (€)"
          value={formData.precio_base}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="platos_entrada"
          placeholder="Entradas (Ej: ENS001,ENS002)"
          value={formData.platos_entrada}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="platos_principal"
          placeholder="Platos principales"
          value={formData.platos_principal}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="platos_postre"
          placeholder="Postres"
          value={formData.platos_postre}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="incluye"
          placeholder="Incluye (pan, agua...)"
          value={formData.incluye}
          onChange={handleChange}
        />

        <textarea
          name="notas"
          placeholder="Notas"
          value={formData.notas}
          onChange={handleChange}
          style={{ minHeight: "60px" }}
        />

        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Enviar Menú
        </button>
      </form>
    </div>
  );
}
