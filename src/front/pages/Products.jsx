import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./products.css";

const MOCK_PRODUCTS = [
  { id: "1", name: "Producto A", price: 19.99, imageUrl: "/images/a.jpg", category: "nuevo" },
  { id: "2", name: "Producto B", price: 24.5, imageUrl: "/images/b.jpg", category: "ofertas" },
  { id: "3", name: "Producto C", price: 12, imageUrl: "/images/c.jpg", category: "popular" },
  { id: "4", name: "Producto D", price: 31.75, imageUrl: "/images/d.jpg", category: "popular" },
  { id: "5", name: "Producto E", price: 8.95, imageUrl: "/images/e.jpg", category: "nuevo" },
  { id: "6", name: "Producto F", price: 15.0, imageUrl: "/images/f.jpg", category: "ofertas" },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todas");
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setProducts(MOCK_PRODUCTS);
  }, []);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setCategory(searchParams.get("cat") || "todas");
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const okCat = category === "todas" ? true : p.category === category;
      const okTxt = q === "" ? true : p.name.toLowerCase().includes(q);
      return okCat && okTxt;
    });
  }, [products, query, category]);

  const onChangeCategory = (cat) => {
    setCategory(cat);
    const next = new URLSearchParams(searchParams);
    if (cat && cat !== "todas") next.set("cat", cat);
    else next.delete("cat");
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="products-page">
      {/* Backdrop para móvil */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="content">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <button
            className="sidebar-close"
            aria-label="Cerrar filtros"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>

          <h4>Categorías</h4>
          <ul>
            {["todas", "nuevo", "popular", "ofertas"].map((cat) => (
              <li key={cat}>
                <label className="radio">
                  <input
                    type="radio"
                    name="cat"
                    checked={category === cat}
                    onChange={() => onChangeCategory(cat)}
                  />
                  <span className="label">{cat[0].toUpperCase() + cat.slice(1)}</span>
                </label>
              </li>
            ))}
          </ul>

          <h4 className="sidebar-title">Colecciones</h4>
          <ul>
            <li><a href="#c1">Lo último</a></li>
            <li><a href="#c2">Más vendidos</a></li>
            <li><a href="#c3">Temporada</a></li>
          </ul>
        </aside>

        {/* Main */}
        <main className="main">
          {/* Botón para abrir filtros en pantallas pequeñas */}
          <div className="filters-bar">
            <button
              className="filters-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir filtros"
            >
              ☰ Filtros
            </button>
          </div>

          <section className="grid">
            {filtered.map((p) => (
              <article className="card" key={p.id}>
                <div className="thumb">
                  <img src={p.imageUrl} alt={p.name} />
                </div>
                <div className="info">
                  <h3 className="name">{p.name}</h3>
                  <div className="row">
                    <span className="price">{p.price.toFixed(2)} €</span>
                    <button className="mini-btn">Añadir</button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="custom-cta">
            <button className="cta-btn" onClick={() => alert("Abrir flujo de pedido personalizado")}>
              Pedido personalizado
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}
