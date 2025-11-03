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
      setError("Error at login. Please try again.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-top vh-100 bg-gray-900">
      <div className="p-4 shadow-lg" style={{ width: "100%", maxWidth: "400px", marginTop: "50px", backgroundColor: "#fff", borderRadius: "8px", height: "400px" }}>
        <h2 className="text-center mb-4 fw-bold">Login</h2>

        {error && <p className="text-danger text-center">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="user" className="form-label">Email</label>
            <input
              type="text"
              id="user"
              name="user"
              className="form-control"
              placeholder="Ej: usero@correo.com"
              value={form.user}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>

        <div className="text-center mt-3">
          <span>Don't you have an account? </span>
          <button type="button" className="btn btn-link p-0" onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
