import React, { useState } from "react";

export const Register = () => {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    direccion: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!form.nombre || !form.apellido || !form.direccion || !form.email || !form.password || !form.confirmPassword) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setStatus("loading");
      setError("");

      // Envía al backend
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          direccion: form.direccion,
          email: form.email,
          password: form.password,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setStatus("success");
      setForm({
        nombre: "",
        apellido: "",
        direccion: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error en registro:", err);
      setError("No se pudo registrar el usuario. Inténtalo más tarde.");
      setStatus("error");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <h2 className="text-center mb-4 fw-bold">Registro de Usuario</h2>

      {status === "loading" && <p className="text-center">Enviando datos...</p>}
      {status === "success" && (
        <p className="text-success text-center">¡Usuario registrado correctamente!</p>
      )}
      {error && <p className="text-danger text-center">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              name="nombre"
              className="form-control"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Apellido</label>
            <input
              type="text"
              name="apellido"
              className="form-control"
              value={form.apellido}
              onChange={handleChange}
              placeholder="Tu apellido"
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Correo electrónico</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={form.email}
            onChange={handleChange}
            placeholder="tucorreo@ejemplo.com"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={form.password}
            onChange={handleChange}
            placeholder="********"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirmar contraseña</label>
          <input
            type="password"
            name="confirmPassword"
            className="form-control"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="********"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={status === "loading"}
        >
          Registrar
        </button>
      </form>

      <p className="text-center mt-3">
        ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
      </p>
    </div>
  );
};

export default Register;
