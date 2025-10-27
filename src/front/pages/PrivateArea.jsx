import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const protectedRoute = async () => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) return null; // evita Bearer null

    const res = await fetch("/protected", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
      // útil para ver el motivo exacto del 422
      const ct = res.headers.get("content-type") || "";
      const payload = ct.includes("application/json") ? await res.json() : await res.text();
      console.warn("Protected failed:", payload);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Protected route error:", err);
    return null;
  }
};

export const PrivateArea = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const data = await protectedRoute();
      if (!data) {
        navigate("/login");
        return;
      }
      setUserData(data);
    };
    checkAuth();
  }, [navigate]);

  if (!userData) {
    return <div className="text-center mt-5">Comprobando autenticación...</div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Zona Privada</h1>
      <div className="card p-4 shadow-sm">
        <h4>Bienvenido, {userData.firstname} {userData.lastname}</h4>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Rol:</strong> {userData.rol}</p>
        <p><strong>Activo:</strong> {userData.is_active ? "Sí" : "No"}</p>
        <p><strong>Fecha de registro:</strong> {new Date(userData.created_at).toLocaleDateString()}</p>

        <button
          className="btn btn-secondary mt-3"
          onClick={() => {
            sessionStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};
