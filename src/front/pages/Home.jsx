import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

// Agrupa en chunks de tamaño `size`: [a,b,c,d,e,f] -> [[a,b,c,d],[e,f,g,h]]
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
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [error, setError] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [flippedArtist, setFlippedArtist] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setStatus("loading");
        const res = await fetch("/products");
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

  const slides = useMemo(() => chunk(all_products, 4), [all_products]);

  return (
    <div className="container-fluid my-5">
      <h2 className="text-center mb-4 fw-bold">Our Product</h2>

      {status === "loading" && <p className="text-center">Cargando productos…</p>}
      {status === "error" && <p className="text-danger text-center">{error}</p>}

      {slides.length > 0 && (
  <div className="carousel-container">
    {/* Botón izquierda */}
    <button
      className="scroll-btn left"
      onClick={() =>
        document.querySelector("#carouselTrack").scrollBy({ left: -1000, behavior: "smooth" })
      }
    >
      ‹
    </button>

    {/* Carrusel principal */}
    <div className="carousel-track" id="carouselTrack">
      {slides.flat().slice(0, 12).map((p, i) => { // ← Solo toma los primeros 12 productos (3 páginas de 4)
        const src = normalizeImgPath(p.img_path);
        return (
          <div
            key={`${p.id ?? p.name}-${i}`}
            className="carousel-card"
            onClick={() => navigate(`/product/${p.id}`)}
          >
            <div className="image-wrapper">
              <img
                src={src || "/assets/img/placeholder.jpg"}
                alt={p.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/assets/img/placeholder.jpg";
                }}
              />
            </div>
            <div className="carousel-info">
              <h5>{p.name}</h5>
              <p className="price">{Number(p.price ?? 0).toFixed(2)} €</p>
            </div>
          </div>
        );
      })}
    </div>

    {/* Botón derecha */}
    <button
      className="scroll-btn right"
      onClick={() =>
        document.querySelector("#carouselTrack").scrollBy({ left: 1000, behavior: "smooth" })
      }
    >
      ›
    </button>
  </div>
)}


      {/* Secciones debajo del carrusel */}
      <div className="row mt-5 text-center">
        <div className="col-md-6 mb-4">
          <h2>Nosotros</h2>
          <div
            className={`flip-card ${flipped ? "flipped" : ""}`}
            onClick={() => setFlipped(!flipped)}
          >
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <img
                  src="/assets/img/nosotros.jpg"
                  alt="Nosotros"
                  className="img-fluid rounded"
                  style={{ maxHeight: 250, objectFit: "cover" }}
                  loading="lazy"
                />
              </div>

              <div className="flip-card-back">
                <p>
                  Somos un grupo de Artistas emprendedores apasionados por el arte y la
                  creatividad. Trabajamos para ofrecer productos únicos y llenos de
                  inspiración. Es un nuevo comienzo: nuestro arte es único.
                </p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-muted">Haz clic para girar</p>
        </div>

        <div className="col-md-6 mb-4">
          <h2>Artistas</h2>
          <div
            className={`flip-card ${flippedArtist ? "flipped" : ""}`}
            onClick={() => setFlippedArtist(!flippedArtist)}
          >
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <img
                  src="/assets/img/artistas.jpg"
                  alt="Artistas"
                  className="img-fluid rounded"
                  style={{ maxHeight: 250, objectFit: "cover" }}
                  loading="lazy"
                />
              </div>

              <div className="flip-card-back text-start">
                <p>
                  <strong>Julia Navio</strong> — especialidad: escultura, pintura,
                  fotografía.
                </p>
                <p>
                  <strong>Joaquín E. Rivero Delgado</strong> — especialidad: pintura,
                  escultura.
                </p>
                <p>
                  <strong>José Rey</strong> — especialidad: arte digital, fotografía.
                </p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-muted">Haz clic para girar</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
