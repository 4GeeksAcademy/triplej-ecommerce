import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./products.css";

// Normaliza rutas de imágenes que vienen de la API (evita // y fuerza barra inicial)
const normalizeImgPath = (path) => {
  let s = (path ?? "").toString().trim();
  if (!s) return "";
  s = s.replace(/^\/+/, "/");
  if (!s.startsWith("/")) s = `/${s}`;
  return s;
};

// Labels legibles para categorías
const categoryLabel = (cat) => {
  const map = { home_decoration: "Lamps", sculptures: "Sculptures", statue: "Statues" };
  return map[cat] ?? cat;
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todas");
  const [products, setProducts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);        // móvil (off-canvas)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop (colapsado)
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [error, setError] = useState("");

  // Cargar productos desde el backend
  useEffect(() => {
    const load = async () => {
      try {
        setStatus("loading");
        setError("");
        const res = await fetch("/products"); // proxy Vite
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

  // Sincroniza estado con la URL
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setCategory(searchParams.get("cat") || "todas");
  }, [searchParams]);

  // Categorías dinámicas
  const availableCategories = useMemo(() => {
    const set = new Set(products.map((p) => (p.category || "").toString().toLowerCase()));
    const list = [...set].filter(Boolean).sort();
    return ["todas", ...list];
  }, [products]);

  // Filtros
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const cat = (p.category || "").toString().toLowerCase();
      const okCat = category === "todas" ? true : cat === category;
      const okTxt = q === "" ? true : (p.name || "").toLowerCase().includes(q);
      return okCat && okTxt;
    });
  }, [products, query, category]);

  // Handlers
  const onChangeCategory = (cat) => {
    setCategory(cat);
    const next = new URLSearchParams(searchParams);
    if (cat && cat !== "todas") next.set("cat", cat);
    else next.delete("cat");
    setSearchParams(next, { replace: true });
  };
  const onSubmitSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (query.trim()) next.set("q", query.trim());
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };
  const formatPrice = (n) => `${Number(n ?? 0).toFixed(2)} €`;

  return (
    <div className="products-page">
      {/* Backdrop para móvil */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Cuando está colapsado en desktop, ajustamos columna 1 */}
      <div className={`content ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        {/* Sidebar */}
        <aside
          className={`sidebar ${sidebarOpen ? "open" : ""} ${sidebarCollapsed ? "collapsed" : ""}`}
        >
          {/* Flecha expandir/contraer (solo desktop; en móvil se oculta por CSS) */}
          <button
            className="sidebar-toggle"
            type="button"
            aria-label={sidebarCollapsed ? "Expandir filtros" : "Contraer filtros"}
            aria-expanded={!sidebarCollapsed}
            onClick={() => setSidebarCollapsed((s) => !s)}
          >
            {/* Chevron que rota con CSS */}
            <svg viewBox="0 0 24 24" className={`chev ${sidebarCollapsed ? "right" : "left"}`} aria-hidden="true">
              <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Botón cerrar (off-canvas móvil) */}
          <button
            className="sidebar-close"
            aria-label="Cerrar filtros"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>

          {/* Contenido del sidebar (se oculta en .collapsed vía CSS) */}
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
                      onChange={() => onChangeCategory(cat)}
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
          {/* Barra superior */}
          <div className="filters-bar">
            <button
              className="filters-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir filtros"
            >
              ☰ Filtros
            </button>

            <form className="search" onSubmit={onSubmitSearch}>
              <input
                type="search"
                placeholder="Buscar productos…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit">Buscar</button>
            </form>
          </div>

          {/* Estados */}
          {status === "loading" && <p className="muted">Cargando productos…</p>}
          {status === "error" && <p className="text-danger">Error: {error}</p>}

          {/* Grid */}
          <section className="grid">
            {filtered.map((p) => {
              const src = normalizeImgPath(p.img_path);
              return (
                <article className="card" key={p.id ?? p.name}>
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
                        {categoryLabel((p.category || "").toString().toLowerCase())}
                      </small>
                    </div>

                    <div className="actions">
                      <button
                        className="mini-btn"
                        onClick={() => alert(`Añadido: ${p.name}`)}
                      >
                        Añadir
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

          <section className="custom-cta">
            <button
              className="cta-btn"
              onClick={() => alert("Abrir flujo de pedido personalizado")}
            >
              Pedido personalizado
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}
