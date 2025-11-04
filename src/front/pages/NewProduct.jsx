import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export const NewProduct = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        category: "",
        details: "",
        price: "",
        amount: ""
    });

    const [error, setError] = useState("");
    const [status, setStatus] = useState("idle");
    const [successMsg, setSuccessMsg] = useState("");
    const img = {img_path: "/public/assets/img/placeholder.jpg"};

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");

        if (!form.name || !form.category || !form.details || !form.price) {
            setError("Please fill in all required fields.");
            return;
        }

        setStatus("loading");
        fetch("/product", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({form , user_id: currentUser['id'], img}),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setStatus("success");
                setSuccessMsg("Product added successfully!");
                setForm({
                    name: "",
                    category: "",
                    details: "",
                    price: "",
                });
            })
            .catch((err) => {
                console.error("Error adding product:", err);
                setStatus("error");
                setError("Failed to add product.");
            });

        // Si el backend falla y responde HTML, evita el "Unexpected token '<'"
        /* const ct = res.headers.get("content-type") || "";
        const payload = ct.includes("application/json") ? await res.json() : { msg: await res.text() }; */

        // Redirige al login tras 1.5s
        setTimeout(() => navigate("/"), 1500);
    };


    return (
        <div className="container-fluid h-100">
            <div className="row justify-content-center">
                <h2 className="mt-4 mb-3 text-center">Add New Product</h2>
                {status === "loading" && <p className="text-center">Sending data...</p>}
                {successMsg && <p className="text-success text-center">{successMsg}</p>}
                {error && <p className="text-danger text-center">{error}</p>}
                <div className="col-8">
                    <form className="mt-3" onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-10 mb-3">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Product name"
                                    required
                                />
                            </div>
                            <div className="col-2 mb-3">
                                <label className="form-label invisible">.</label>
                                <select 
                                    className="form-select" 
                                    name="category" 
                                    aria-label="Select category" 
                                    onChange={handleChange}
                                    value={form.category}
                                    required>
                                    <option value="">Category</option>
                                    <option value="LAMPS">Lamps</option>
                                    <option value="SCULPTURES">Sculptures</option>
                                    <option value="STATUES">Statues</option>
                                </select>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col mb-3">
                                <label className="form-label">Details</label>
                                <textarea 
                                    className="form-control" 
                                    onChange={handleChange} 
                                    id="details" 
                                    name="details" 
                                    rows="5" 
                                    placeholder="Write a short details..." 
                                    required
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-2 mb-3">
                                <div className="mb-3">
                                    <label className="form-label">Price</label>
                                    <input 
                                        className="form-control" 
                                        name="price" 
                                        onChange={handleChange} 
                                        type="number"
                                        min="1" 
                                        step="any" 
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-2 mb-3">
                                <div className="mb-3">
                                    <label className="form-label">Amount</label>
                                    <input 
                                        className="form-control" 
                                        name="amount" 
                                        onChange={handleChange} 
                                        type="number"
                                        min="1" 
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row justify-content-center">
                            <div className="col-10 mb-3 text-center">
                                <button
                                    type="submit"
                                    className="btn btn-primary w-50"
                                >
                                    Upload
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}