import { useState } from "react";
import axios from "axios";

export default function Menu() {
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

    try {
      // Validación básica
      if (
        !formData.precio_base ||
        !formData.platos_entrada ||
        !formData.platos_principal ||
        !formData.platos_postre
      ) {
        throw new Error("Todos los campos obligatorios deben estar completos");
      }

      const response = await axios.post("http://localhost:8000/menu-del-dia/", {
        precio_base: parseFloat(formData.precio_base),
        platos_entrada: formData.platos_entrada,
        platos_principal: formData.platos_principal,
        platos_postre: formData.platos_postre,
        incluye: formData.incluye,
        notas: formData.notas,
      });

      setMessage(`Menú creado exitosamente con ID: ${response.data.id}`);
      // Resetear el formulario
      setFormData({
        precio_base: "",
        platos_entrada: "",
        platos_principal: "",
        platos_postre: "",
        incluye: "pan,agua",
        notas: "",
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Crear Menú del Día</h1>

      {message && (
        <div style={{ color: "green", margin: "10px 0" }}>{message}</div>
      )}
      {error && <div style={{ color: "red", margin: "10px 0" }}>{error}</div>}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <div>
          <label>Precio Base (€):</label>
          <input
            type="number"
            name="precio_base"
            value={formData.precio_base}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>Platos de Entrada (IDs separados por comas):</label>
          <input
            type="text"
            name="platos_entrada"
            value={formData.platos_entrada}
            onChange={handleChange}
            placeholder="Ej: ENS001,ENS002"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>Platos Principales (IDs separados por comas):</label>
          <input
            type="text"
            name="platos_principal"
            value={formData.platos_principal}
            onChange={handleChange}
            placeholder="Ej: PRN001,PRN002"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>Postres (IDs separados por comas):</label>
          <input
            type="text"
            name="platos_postre"
            value={formData.platos_postre}
            onChange={handleChange}
            placeholder="Ej: PST001,PST002"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>Incluye (separado por comas):</label>
          <input
            type="text"
            name="incluye"
            value={formData.incluye}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>Notas:</label>
          <textarea
            name="notas"
            value={formData.notas}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", minHeight: "80px" }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 15px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Crear Menú
        </button>
      </form>
    </div>
  );
}
