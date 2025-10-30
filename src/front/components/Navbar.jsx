import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext"; // Ruta del contexto
import { useFavorites } from "../FavoritesContext";

export const Navbar = () => {
  const { currentUser, logout } = useAuth() || {}; // Accedemos al contexto
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [term, setTerm] = useState("");
  const { favorites, removeFavorite } = useFavorites();
  const [products, setProducts] = useState([]);
  
  const favProducts = products.filter((p) => favorites.has(p.id));

  // Maneja la redirección del botón de usuario según si hay usuario autenticado
  const handleUserClick = () => {
    if (currentUser) {
      // Si hay un usuario autenticado, redirige a la PrivateArea
      navigate("/private");
    } else {
      // Si no hay usuario, redirige a login
      navigate("/login");
    }
  };

  // Mantener el input del navbar sincronizado con ?q= cuando estás en /products
  useEffect(() => {
    if (location.pathname.startsWith("/products")) {
      setTerm(searchParams.get("q") || "");
    } else {
      // si prefieres no limpiar al salir de products, quita esta línea
      setTerm("");
    }
  }, [location, searchParams]);

  useEffect(() => {
    products &&
    fetch("/products")
      .then((res) => res.json())
      .then(data => {
        console.log("Navbar products: ", data)
        setProducts(data)})
      .catch(console.error);
  }, []);


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


          <div className="d-flex align-items-center gap-3">
            <div className="dropdown">
              <a
                href="#"
                className="text-danger fs-5"
                id="favoritesDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fa-solid fa-heart"></i>
              </a>

              <ul
                className="dropdown-menu dropdown-menu-end p-2 shadow"
                aria-labelledby="favoritesDropdown"
                style={{ minWidth: "250px" }}
              >
                <li className="dropdown-header fw-bold text-danger">Your Favorites ❤️</li>
                <li><hr className="dropdown-divider" /></li>
                {
                  favProducts.length > 0 ? 
                  favProducts.map((prod, id) => (
                      <li key={id} className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <p className="m-0 fw-bold">{prod.name}</p>
                          <small className="text-muted">{prod.category}</small>
                        </div>
                        <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => removeFavorite(prod.id)}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </li>
                    )) :
                    <li><span className="dropdown-item-text text-muted">No favorites yet</span></li>

                }


              </ul>
            </div>
            <Link to="/cart" className="text-success fs-5">
              <i className="fa-solid fa-cart-shopping"></i>
            </Link>
            <Link
              to={currentUser ? "/private" : "/login"}  // Lógica directamente en el to
              className="btn btn-link p-0 text-primary fs-5"
            >
              <i className="fa-solid fa-user"></i>
            </Link>
          </div>
        </div>
      </div>
    </nav >
  );
};

export default Navbar;