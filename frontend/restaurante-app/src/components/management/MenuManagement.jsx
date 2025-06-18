import React, { useState, useEffect } from "react";
import axios from "axios";

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    id: "", // Solo para edición
    nombre: "",
    descripcion: "",
    precio: "", // Asegúrate de que el tipo coincida con tu backend (float/decimal)
    disponible: true, // Valor por defecto
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      // Asumiendo que esta ruta no requiere autenticación por ahora, o la añades si es necesario
      const response = await axios.get("http://localhost:5000/api/menu"); // Ajusta la ruta si es diferente
      setMenuItems(response.data);
      setMessage({ text: "", type: "" });
    } catch (error) {
      console.error("Error al obtener ítems del menú:", error);
      setMessage({ text: "Error al cargar ítems del menú", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      nombre: item.nombre,
      descripcion: item.descripcion || "",
      precio: item.precio,
      disponible: item.disponible,
    });
    setMessage({ text: "", type: "" });
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setFormData({
      id: "",
      nombre: "",
      descripcion: "",
      precio: "",
      disponible: true,
    });
    setMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Añade si la ruta requiere autenticación
        },
      };

      const dataToSend = { ...formData };
      dataToSend.precio = parseFloat(dataToSend.precio); // Convertir a número antes de enviar

      if (editingItem) {
        await axios.put(
          `http://localhost:5000/api/menu/${editingItem.id}`,
          dataToSend,
          config
        );
        setMessage({
          text: "Ítem del menú actualizado exitosamente",
          type: "success",
        });
      } else {
        if (!formData.nombre || !formData.precio) {
          setMessage({
            text: "Nombre y Precio son requeridos para un nuevo ítem.",
            type: "error",
          });
          setLoading(false);
          return;
        }
        await axios.post("http://localhost:5000/api/menu", dataToSend, config);
        setMessage({
          text: "Ítem del menú creado exitosamente",
          type: "success",
        });
      }

      setFormData({
        id: "",
        nombre: "",
        descripcion: "",
        precio: "",
        disponible: true,
      });
      setEditingItem(null);
      fetchMenuItems();
    } catch (error) {
      console.error(
        "Error al guardar ítem del menú:",
        error.response?.data || error.message
      );
      setMessage({
        text: error.response?.data?.error || "Error al guardar ítem del menú",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este ítem del menú?"
      )
    ) {
      setLoading(true);
      try {
        // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Añade si la ruta requiere autenticación
        await axios.delete(`http://localhost:5000/api/menu/${itemId}`);
        setMessage({
          text: "Ítem del menú eliminado exitosamente",
          type: "success",
        });
        fetchMenuItems();
      } catch (error) {
        console.error(
          "Error al eliminar ítem del menú:",
          error.response?.data || error.message
        );
        setMessage({
          text:
            error.response?.data?.error || "Error al eliminar ítem del menú",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="management-section">
      <h2>Gestión de Menú</h2>
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Formulario de Creación/Edición */}
      <div className="form-card">
        <h3>
          {editingItem ? "Editar Ítem del Menú" : "Crear Nuevo Ítem del Menú"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Precio:</label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              step="0.01" // Para permitir decimales
              required
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="disponible"
                checked={formData.disponible}
                onChange={handleChange}
              />
              Disponible
            </label>
          </div>
          <button type="submit" disabled={loading}>
            {loading
              ? "Guardando..."
              : editingItem
              ? "Actualizar Ítem"
              : "Crear Ítem"}
          </button>
          {editingItem && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="cancel-button"
            >
              Cancelar Edición / Crear Nuevo
            </button>
          )}
        </form>
      </div>

      {/* Lista de Ítems del Menú */}
      <h3>Lista de Ítems</h3>
      {loading && menuItems.length === 0 ? (
        <p>Cargando ítems del menú...</p>
      ) : menuItems.length === 0 ? (
        <p>No hay ítems en el menú.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Disponible</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.nombre}</td>
                <td>{item.precio}</td>
                <td>{item.disponible ? "Sí" : "No"}</td>
                <td>
                  <button
                    onClick={() => handleEditClick(item)}
                    className="edit-button"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="delete-button"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
