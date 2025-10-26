import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    direccion: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [status, setStatus] = useState("idle");   // idle | loading | success | error
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    // Validaciones básicas
    if (!form.nombre || !form.apellido || !form.email || !form.password || !form.confirmPassword) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setStatus("loading");

      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 👇 Enviamos solo lo necesario. El backend mapea y fija el rol por defecto.
        body: JSON.stringify({
          firstname: form.nombre,
          lastname: form.apellido,
          email: form.email,
          password: form.password,
          // is_active lo puede fijar el backend si quieres; si no, descomenta:
          // is_active: true,
        }),
      });

      // Si el backend falla y responde HTML, evita el "Unexpected token '<'"
      const ct = res.headers.get("content-type") || "";
      const payload = ct.includes("application/json") ? await res.json() : { msg: await res.text() };

      if (!res.ok) {
        throw new Error(payload?.msg || `HTTP ${res.status}`);
      }

      setStatus("success");
      setSuccessMsg("¡Usuario registrado correctamente! Redirigiendo al login…");

      // Limpia el formulario
      setForm({
        nombre: "",
        apellido: "",
        direccion: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Redirige al login tras 1.5s
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Error en registro:", err);
      setError(err.message || "No se pudo registrar el usuario.");
      setStatus("error");
    } finally {
      // No vuelvas a "idle" si quieres mantener visible el mensaje de success/error
      // Si prefieres, puedes dejarlo en "idle":
      // setStatus("idle");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <h2 className="text-center mb-4 fw-bold">Registro de Usuario</h2>

      {status === "loading" && <p className="text-center">Enviando datos...</p>}
      {successMsg && <p className="text-success text-center">{successMsg}</p>}
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
            minLength={6}
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
