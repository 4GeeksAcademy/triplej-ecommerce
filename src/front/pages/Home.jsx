import React from "react";
import product1 from "../assets/img/product1.jpg";
import product2 from "../assets/img/product2.jpg";
import product3 from "../assets/img/product3.jpg";
import product4 from "../assets/img/product4.jpg";
import nosotrosImg from "../assets/img/nosotros.jpg";
import artistasImg from "../assets/img/artistas.jpg";

export const Home = () => {
  return (
    
	<div className="container-fluid my-5">

      {/* Título del carrusel */}
      <h2 className="text-center mb-4 fw-bold">Best Product</h2>

      {/* Carrusel centrado con 10% de separación a cada lado */}
      <div
        className="carousel-container mx-auto"
        style={{
          width: "90%",       // ocupa 80% del ancho
          marginLeft: "5%",  // separación izquierda
          marginRight: "5%", // separación derecha
        }}
      >
        <div
          id="carouselExampleControls"
          className="carousel slide"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner">
            {/* Primer grupo de 3 imágenes */}
            <div className="carousel-item active">
              <div className="d-flex justify-content-center">
                <img
                  src={product1}
                  alt="Product 1"
                  className="mx-2"
                  style={{ width: "33%", height: "250px", objectFit: "cover" }}
                />
                <img
                  src={product2}
                  alt="Product 2"
                  className="mx-2"
                  style={{ width: "33%", height: "250px", objectFit: "cover" }}
                />
                <img
                  src={product3}
                  alt="Product 3"
                  className="mx-2"
                  style={{ width: "33%", height: "250px", objectFit: "cover" }}
                />
              </div>
            </div>

            {/* Segundo grupo de 3 imágenes */}
            <div className="carousel-item">
              <div className="d-flex justify-content-center">
                <img
                  src={product2}
                  alt="Product 2"
                  className="mx-2"
                  style={{ width: "33%", height: "250px", objectFit: "cover" }}
                />
                <img
                  src={product3}
                  alt="Product 3"
                  className="mx-2"
                  style={{ width: "33%", height: "250px", objectFit: "cover" }}
                />
                <img
                  src={product4}
                  alt="Product 4"
                  className="mx-2"
                  style={{ width: "33%", height: "250px", objectFit: "cover" }}
                />
              </div>
            </div>
          </div>

          {/* Flechas */}
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselExampleControls"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Anterior</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselExampleControls"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Siguiente</span>
          </button>
        </div>
      </div>

      {/* Secciones debajo del carrusel */}
      <div className="row mt-5 text-center">
        <div className="col-md-6 mb-4">
          <h2>Nosotros</h2>
          <img
            src={nosotrosImg}
            alt="Nosotros"
            className="img-fluid rounded"
            style={{ maxHeight: "250px", objectFit: "cover" }}
          />
        </div>
        <div className="col-md-6 mb-4">
          <h2>Artistas</h2>
          <img
            src={artistasImg}
            alt="Artistas"
            className="img-fluid rounded"
            style={{ maxHeight: "250px", objectFit: "cover" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
