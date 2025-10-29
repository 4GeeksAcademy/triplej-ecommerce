import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext"; // Ruta del contexto

export const PrivateArea = () => {
  const { currentUser, logout } = useAuth(); // Agregamos logout aquí
  const navigate = useNavigate();

  // Verifica si el usuario está autenticado
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return <div>Comprobando autenticación...</div>;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="p-4 shadow-sm">
        <h1>Profile</h1>
        <h4>Welcome, {currentUser.firstname} {currentUser.lastname}</h4>
        <p><strong>Email:</strong> {currentUser.email}</p>
        <p><strong>Registration Date:</strong> {new Date(currentUser.created_at).toLocaleDateString()}</p>

        {/* Logout button */}
        <div className="d-flex gap-3">
          <Link to="/cart">
            <button className="btn btn-secondary mt-3"  style={{ backgroundColor: "#BC9ECC" , border: "#BC9ECC" }}>
              Go to Cart
            </button>
          </Link>
          <button className="btn btn-danger mt-3" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
