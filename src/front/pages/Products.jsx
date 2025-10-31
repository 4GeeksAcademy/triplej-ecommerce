import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./products.css";
import { useAuth } from "../AuthContext";
import { useFavorites } from "../FavoritesContext";

// Normaliza rutas de imágenes
const normalizeImgPath = (path) => {
  let s = (path ?? "").toString().trim();
  if (!s) return "";
  s = s.replace(/^\/+/, "/");
  if (!s.startsWith("/")) s = `/${s}`;
  return s;
};

// Labels legibles
const categoryLabel = (cat) => {
  const map = {
    home_decoration: "Lamps",
    sculptures: "Sculptures",
    statue: "Statues",
  };
  return map[cat] ?? cat;
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todas");
  const [products, setProducts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();

  // Cargar productos
  useEffect(() => {
    const load = async () => {
      try {
        setStatus("loading");
        const res = await fetch("/products");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
        setStatus("idle");
      } catch (e) {
        console.error("Error cargando productos:", e);
        setError(String(e));
        setStatus("error");
      }
    };
    load();
  }, []);

  // Filtros
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setCategory(searchParams.get("cat") || "todas");
  }, [searchParams]);

  const availableCategories = useMemo(() => {
    const set = new Set(
      products.map((p) => (p.category || "").toString().toLowerCase())
    );
    return ["todas", ...[...set].filter(Boolean).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const cat = (p.category || "").toString().toLowerCase();
      const okCat = category === "todas" ? true : cat === category;
      const okTxt = q === "" ? true : (p.name || "").toLowerCase().includes(q);
      return okCat && okTxt;
    });
  }, [products, query, category]);

  const formatPrice = (n) => `${Number(n ?? 0).toFixed(2)} €`;

  return (
    <div className="products-page">
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`content ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        {/* Sidebar */}
        <aside
          className={`sidebar ${sidebarOpen ? "open" : ""} ${sidebarCollapsed ? "collapsed" : ""
            }`}
        >
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed((s) => !s)}
          >
            <svg
              viewBox="0 0 24 24"
              className={`chev ${sidebarCollapsed ? "right" : "left"}`}
            >
              <path
                d="M15 6l-6 6 6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>

          <div className="sidebar-content">
            <h4>Categorías</h4>
            <ul>
              {availableCategories.map((cat) => (
                <li key={cat}>
                  <label className="radio">
                    <input
                      type="radio"
                      name="cat"
                      checked={category === cat}
                      onChange={() => {
                        const next = new URLSearchParams(searchParams);
                        if (cat && cat !== "todas") next.set("cat", cat);
                        else next.delete("cat");
                        setSearchParams(next, { replace: true });
                        setCategory(cat);
                      }}
                    />
                    <span className="label">
                      {cat === "todas" ? "Todas" : categoryLabel(cat)}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          {status === "loading" && <p className="muted">Cargando productos…</p>}
          {status === "error" && <p className="text-danger">Error: {error}</p>}

          {/* Grid */}
          <section className="grid">
            {filtered.map((p) => {
              const src = normalizeImgPath(p.img_path);
              const isFav = favorites.has(p.id);

              return (
                <article
                  className="card"
                  key={p.id ?? p.name}
                  onClick={() => navigate(`/product/${p.id}`)} 
                  style={{ cursor: "pointer" }}
                >
                  <div className="thumb">
                    <img
                      src={src || "/assets/img/placeholder.jpg"}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/assets/img/placeholder.jpg";
                      }}
                    />
                  </div>

                  <div className="info">
                    <h3 className="name">{p.name}</h3>

                    <div className="meta">
                      <span className="price">{formatPrice(p.price)}</span>
                      <small className="cat muted">
                        {categoryLabel(
                          (p.category || "").toString().toLowerCase()
                        )}
                      </small>
                    </div>

                    <div className="actions">
                      <button
                        className={`heart-btn ${isFav ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation(); // evita abrir el producto al hacer click
                          toggleFavorite(p.id);
                        }}
                        aria-label={
                          isFav
                            ? "Quitar de favoritos"
                            : "Añadir a favoritos"
                        }
                      >
                        <i
                          className={favorites.has(p.id) ? "fas fa-heart" : "far fa-heart"}
                        ></i>
                      </button>

                      <button
                        className="mini-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p);
                        }}
                        disabled={disabled}

                      >
                        Añadir al carrito
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
            {status === "idle" && filtered.length === 0 && (
              <p className="muted">No hay resultados con esos filtros.</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
