import React, { useEffect, useMemo, useState } from "react";

// Agrupa en chunks de tamaño `size`: [a,b,c,d,e,f] -> [[a,b,c],[d,e,f]]
const chunk = (arr, size) =>
  arr.reduce((acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), []);

// Normaliza la ruta (evita // y asegura barra inicial)
const normalizeImgPath = (path) => {
  let s = (path ?? "").toString().trim();
  if (!s) return "";
  s = s.replace(/^\/+/, "/");
  if (!s.startsWith("/")) s = `/${s}`;
  return s;
};

export const Home = () => {
  const [all_products, setAllProducts] = useState([]);
  const [status, setStatus] = useState("idle");  // idle | loading | error
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setStatus("loading");
        const res = await fetch("/products"); // ← pasa por el proxy
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAllProducts(data);
        setStatus("idle");
      } catch (e) {
        console.error("Error cargando productos:", e);
        setError(String(e));
        setStatus("error");
      }
    };
    load();
  }, []);

  // Prepara slides de 3 productos
  const slides = useMemo(() => chunk(all_products, 3), [all_products]);

  return (
    <div className="container-fluid my-5">
      <h2 className="text-center mb-4 fw-bold">Best Product</h2>

      {status === "loading" && <p className="text-center">Cargando productos…</p>}
      {status === "error" && <p className="text-danger text-center">{error}</p>}

      {slides.length > 0 && (
        <div
          id="carouselProducts"
          className="carousel slide"
          data-bs-ride="carousel"
          style={{ width: "90%", margin: "0 auto" }}
        >
          <div className="carousel-inner">
            {slides.map((group, slideIdx) => (
              <div
                key={`slide-${slideIdx}`}
                className={`carousel-item ${slideIdx === 0 ? "active" : ""}`}
              >
                <div className="d-flex justify-content-center">
                  {group.map((p, i) => {
                    const src = normalizeImgPath(p.img_path);
                    return (
                      <img
                        key={`${p.id ?? p.name}-${i}`}
                        src={src || "/assets/img/placeholder.jpg"}
                        alt={p.name}
                        className="mx-2"
                        style={{ width: "33%", height: "250px", objectFit: "cover", display: "block" }}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null; // evita loop
                          e.currentTarget.src = "/assets/img/placeholder.jpg";
                        }}
                      />
                    );
                  })}
                  
                  {group.length < 3 &&
                    Array.from({ length: 3 - group.length }).map((_, k) => (
                      <img
                        key={`filler-${slideIdx}-${k}`}
                        src="/assets/img/placeholder.jpg"
                        alt="Filler"
                        className="mx-2"
                        style={{ width: "33%", height: "250px", objectFit: "cover", display: "block" }}
                        loading="lazy"
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Flechas */}
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselProducts"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Anterior</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselProducts"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Siguiente</span>
          </button>
        </div>
      )}

      {/* Secciones debajo del carrusel */}
      <div className="row mt-5 text-center">
        <div className="col-md-6 mb-4">
          <h2>Nosotros</h2>
          <img
            src="/assets/img/nosotros.jpg"
            alt="Nosotros"
            className="img-fluid rounded"
            style={{ maxHeight: 250, objectFit: "cover" }}
            loading="lazy"
          />
        </div>
        <div className="col-md-6 mb-4">
          <h2>Artistas</h2>
          <img
            src="/assets/img/artistas.jpg"
            alt="Artistas"
            className="img-fluid rounded"
            style={{ maxHeight: 250, objectFit: "cover" }}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
