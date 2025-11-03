import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./IndividualProduct.css";



export default function IndividualProduct() {
  const { id } = useParams(); // Obtiene el ID desde la URL
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [showTextBox, setShowTextBox] = useState(false);


  const addToCart = (item) => {
    fetch('/my-cart', {
      method: "POST",
      headers: {
        'Content-type': "application/json"
      },
      body: JSON.stringify({ item, currentUser }),
    })
      .then(resp => resp.json())
      .then(data => {
        data.quantity == data.stock ;
        console.log("Item added to cart: ", data)
      })
      .catch(error => console.log(error));
  }

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setStatus("loading");
        const res = await fetch(`/products/${id}`); // endpoint dinámico
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProduct(data);
        setStatus("idle");
      } catch (err) {
        console.error("Error cargando producto:", err);
        setError(String(err));
        setStatus("error");
      }
    };
    loadProduct();
  }, [id]);

  if (status === "loading") {
    return <p className="text-center mt-5">Cargando producto...</p>;
  }

  if (status === "error") {
    return (
      <div className="text-center mt-5">
        <p className="text-danger">Error loading product:</p>
        <pre>{error}</pre>
        <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  if (!product) {
    return <p className="text-center mt-5">Product not found.</p>;
  }

  const imgSrc =
    product.img_path || "/assets/img/placeholder.jpg";

  return (
    <div className="container my-5">
      <button className="btn custom-back-btn mb-4" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="row align-items-start">
        {/* Imagen */}
        <div className="col-md-6 text-center">
          <img
            src={imgSrc}
            alt={product.name}
            className="img-fluid rounded shadow-sm"
            style={{ maxHeight: "400px", objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/assets/img/placeholder.jpg";
            }}
          />
        </div>

        {/* Info */}
        <div className="col-md-6">
          <h2 className="fw-bold mb-3">{product.name}</h2>
          <p className="text-muted">{product.category}</p>
          <p className="lead">{product.details}</p>

          <h4 className="mt-4">
            Precio:{" "}
            <span className="text-success fw-bold">
              {Number(product.price).toFixed(2)} €
            </span>
          </h4>

          <div className="mt-4 d-flex gap-3">
            <div className="position-relative">
              <button
                className="btn btn-outline-primary"
                onClick={() => {
                  addToCart(product);
                  setShowTextBox(true);
                  setTimeout(() => setShowTextBox(false), 2500); 
                }}
              >
                Add to cart
              </button>

              {showTextBox && (
                <div
                  className={`position-absolute top-100 start-50 translate-middle-x mt-2 px-3 py-2 text-white rounded shadow-sm ${
                    currentUser ? "bg-success" : "bg-danger"
                  }`}
                  style={{ fontSize: "0.9rem", whiteSpace: "nowrap" }}
                >
                  {currentUser
                    ? <>Added <strong>{product.name}</strong> to cart</>
                    : <>User not registered</>}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
