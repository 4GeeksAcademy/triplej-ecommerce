import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext"; // Ruta del contexto

export const PrivateArea = () => {
  const { currentUser, logout } = useAuth(); // Agregamos logout aquí
  const navigate = useNavigate();

  // Verifica si el usuario está autenticado
  useEffect(() => {
    if (!currentUser) {
      navigate("/login"); // Si no hay usuario, redirige al login
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return <div>Comprobando autenticación...</div>;
  }

  const handleLogout = () => {
    logout(); // Llamamos a la función logout del contexto
    navigate("/login"); // Redirigimos al login después de cerrar sesión
  };

  return (
    <div className="container mt-5 mb-5">
      <h1 className="mb-4">Zona Privada</h1>
      <div className="card p-4 shadow-sm">
        <h4>Bienvenido, {currentUser.firstname} {currentUser.lastname}</h4>
        <p><strong>Email:</strong> {currentUser.email}</p>
        <p><strong>Rol:</strong> {currentUser.rol}</p>
        <p><strong>Activo:</strong> {currentUser.is_active ? "Sí" : "No"}</p>
        <p><strong>Fecha de registro:</strong> {new Date(currentUser.created_at).toLocaleDateString()}</p>
        
        {/* Botón de cierre de sesión */}
        <button className="btn btn-danger mt-3" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};
