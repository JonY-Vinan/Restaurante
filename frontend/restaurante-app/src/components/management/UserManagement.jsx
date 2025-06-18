import React, { useState, useEffect } from "react";
import axios from "axios";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // Usuario que se está editando (o null para nuevo)
  const [formData, setFormData] = useState({
    id: "", // Solo para edición
    nombre: "",
    email: "",
    telefono: "",
    tipo_usuario: "cliente", // Valor por defecto
    password: "", // Solo para creación o cambio de contraseña
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Necesitarás enviar el token JWT para esta petición protegida
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/usuarios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
      setMessage({ text: "", type: "" });
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setMessage({ text: "Error al cargar usuarios", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono || "", // Asegurar que sea string si es null
      tipo_usuario: user.tipo_usuario,
      password: "", // No cargar la contraseña, siempre se edita aparte
    });
    setMessage({ text: "", type: "" });
  };

  const handleCreateNew = () => {
    setEditingUser(null); // Indicar que es un nuevo usuario
    setFormData({
      id: "",
      nombre: "",
      email: "",
      telefono: "",
      tipo_usuario: "CLIENTE", // Ajustar a tu ENUM de backend si es necesario (CLIENTE, ADMIN, EMPLEADO)
      password: "",
    });
    setMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      if (editingUser) {
        // Actualizar usuario existente
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password; // No enviar si está vacío
        }
        await axios.put(
          `http://localhost:5000/api/usuarios/${editingUser.id}`,
          dataToUpdate,
          config
        );
        setMessage({
          text: "Usuario actualizado exitosamente",
          type: "success",
        });
      } else {
        // Crear nuevo usuario
        // Asegúrate de que los campos requeridos para crear estén presentes
        if (!formData.nombre || !formData.email || !formData.password) {
          setMessage({
            text: "Nombre, Email y Contraseña son requeridos para crear un usuario.",
            type: "error",
          });
          setLoading(false);
          return;
        }
        await axios.post(
          "http://localhost:5000/api/usuarios",
          formData,
          config
        );
        setMessage({ text: "Usuario creado exitosamente", type: "success" });
      }

      setFormData({
        id: "",
        nombre: "",
        email: "",
        telefono: "",
        tipo_usuario: "CLIENTE",
        password: "",
      });
      setEditingUser(null); // Resetear el formulario
      fetchUsers(); // Volver a cargar la lista
    } catch (error) {
      console.error(
        "Error al guardar usuario:",
        error.response?.data || error.message
      );
      setMessage({
        text: error.response?.data?.error || "Error al guardar usuario",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/usuarios/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessage({ text: "Usuario eliminado exitosamente", type: "success" });
        fetchUsers(); // Volver a cargar la lista
      } catch (error) {
        console.error(
          "Error al eliminar usuario:",
          error.response?.data || error.message
        );
        setMessage({
          text: error.response?.data?.error || "Error al eliminar usuario",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="management-section">
      <h2>Gestión de Usuarios</h2>
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Formulario de Creación/Edición */}
      <div className="form-card">
        <h3>{editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}</h3>
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
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Teléfono:</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Tipo de Usuario:</label>
            <select
              name="tipo_usuario"
              value={formData.tipo_usuario}
              onChange={handleChange}
              required
            >
              <option value="CLIENTE">Cliente</option>
              <option value="ADMIN">Admin</option>
              <option value="EMPLEADO">Empleado</option>
            </select>
          </div>
          <div>
            <label>
              Contraseña:{" "}
              {editingUser && (
                <span style={{ fontSize: "0.8em" }}>
                  (Dejar vacío para no cambiar)
                </span>
              )}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              // Si estamos creando, la contraseña es requerida
              required={!editingUser}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading
              ? "Guardando..."
              : editingUser
              ? "Actualizar Usuario"
              : "Crear Usuario"}
          </button>
          {editingUser && (
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

      {/* Lista de Usuarios */}
      <h3>Lista de Usuarios</h3>
      {loading && users.length === 0 ? (
        <p>Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nombre}</td>
                <td>{user.email}</td>
                <td>{user.telefono}</td>
                <td>{user.tipo_usuario}</td>
                <td>
                  <button
                    onClick={() => handleEditClick(user)}
                    className="edit-button"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
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
