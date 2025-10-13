import { Link } from "react-router-dom";
import logo from "../assets/img/logo.png"
export const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg bg-light shadow-sm px-4">
      <div className="container-fluid">
        {/* Logo y nombre */}
        <a className="navbar-brand d-flex align-items-center" href="#">
          <img
            src={logo}
            alt="Logo"
            width="50"
            height="50"
            className="me-2 rounded"
          />
          <span className="fw-bold text-dark">JJJ Shop</span>
        </a>

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
              <a className="nav-link fw-semibold" href="#productos">
                Productos
              </a>
            </li>
          </ul>

          {/* Barra de búsqueda */}
          <form className="d-flex me-3" role="search">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Buscar productos..."
              aria-label="Buscar"
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
            <a href="#carrito" className="text-success fs-5">
              <i className="fa-solid fa-cart-shopping"></i>
            </a>
            <a href="#usuario" className="text-primary fs-5">
              <i className="fa-solid fa-user"></i>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;