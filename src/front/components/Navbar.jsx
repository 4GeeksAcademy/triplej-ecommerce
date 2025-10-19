import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
// import logo from "assets/img/logo.png"

export const Navbar = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [term, setTerm] = useState("");

  // Mantener el input del navbar sincronizado con ?q= cuando estás en /products
  useEffect(() => {
    if (location.pathname.startsWith("/products")) {
      setTerm(searchParams.get("q") || "");
    } else {
      // si prefieres no limpiar al salir de products, quita esta línea
      setTerm("");
    }
  }, [location, searchParams]);

  const onSubmit = (e) => {
    e.preventDefault();
    const q = term.trim();
    // navega a /products con el query param
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };



  return (
    <nav className="navbar navbar-expand-lg bg-light shadow-sm px-4">
      <div className="container-fluid">
        {/* Logo y nombre */}
         <Link className="nav-link fw-semibold" to="/">
          <img
            src="assets/img/logo.png"
            alt="Logo"
            width="50"
            height="50"
            className="me-2 rounded"
          />
          <span className="fw-bold text-dark">JJJ Shop</span>
        </Link>

        {/* Botón menú móvil */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenido colapsable */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Enlaces */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/products">
                Productos
              </Link>
            </li>
          </ul>

          {/* Barra de búsqueda */}
          <form className="d-flex me-3" role="search" onSubmit={onSubmit}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Buscar productos..."
              aria-label="Buscar"
              value={term}
              onChange={e => setTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="submit">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>

          {/* Iconos */}
          <div className="d-flex align-items-center gap-3">
            <a href="#favoritos" className="text-danger fs-5">
              <i className="fa-solid fa-heart"></i>
            </a>
            <Link to="/cart" className="text-success fs-5">
              <i className="fa-solid fa-cart-shopping"></i>
            </Link>
            <Link to="/account" className="text-primary fs-5">
              <i className="fa-solid fa-user"></i>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;