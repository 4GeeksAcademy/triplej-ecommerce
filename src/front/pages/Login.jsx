import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext"; // Ruta del contexto

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate(); // Usamos el hook useNavigate en el componente
  const [form, setForm] = useState({ user: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.user || !form.password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.user,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg || "Error de login");

      login(data.token, data.user); // Usamos la función login del contexto
      navigate("/private"); // Realizamos la redirección aquí

    } catch (err) {
      console.error(err);
      setError("Error al iniciar sesión. Intenta de nuevo.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-lg" style={{ width: "100%", maxWidth: "400px" }}>
        <h2 className="text-center mb-4 fw-bold">Iniciar sesión</h2>

        {error && <p className="text-danger text-center">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="user" className="form-label">Nombre de usuario o correo electrónico</label>
            <input
              type="text"
              id="user"
              name="user"
              className="form-control"
              placeholder="Ej: usuario@correo.com"
              value={form.user}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Iniciar sesión</button>
        </form>

        <div className="text-center mt-3">
          <span>¿No tienes cuenta? </span>
          <button type="button" className="btn btn-link p-0" onClick={() => navigate("/register")}>
            Regístrate
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
