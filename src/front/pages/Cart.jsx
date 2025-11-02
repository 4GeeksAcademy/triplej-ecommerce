import { useEffect, useState } from "react";
import { Counter } from "../components/Counter";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Spinner } from "react-bootstrap";

export const Cart = () => {
    const [subtotal, setSubtotal] = useState(0);
    const [amounts, setAmounts] = useState({});
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handlePay = async () => {
        // Preparamos los items para Stripe
        const items = orders.map((prod, id) => ({
            name: prod['product_details']['name'], 
            unit_amount: Math.round(prod['product_details']['price'] * 100),
            quantity: amounts[id]  
        }));

        // Enviamos los datos del carrito al backend
        const response = await fetch("/create-checkout-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                items: items,
                subtotal: subtotal 
            }),
        });

        const data = await response.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            console.error("Error al procesar el pago", data.error);
        }
    };


    const handleDelete = (prod_id) => {
        fetch(`/my-cart/${prod_id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ currentUser }),
        })
            .then(resp => resp.json())
            .then(data => {
                console.log(data);
                setOrders([...orders.filter(order => order['product_details']['id'] != prod_id)])
            })
    }

    useEffect(() => {
        if (!currentUser) return;

        setLoading(true);
        fetch(`/my-cart/${currentUser.id}`)
            .then(resp => resp.json())
            .then(data => {
                console.log(data);
                const initialAmounts = Object.fromEntries(
                    data[0]['products'].map((prod, id) => [id, prod.quantity_ordered])
                );
                setAmounts(initialAmounts);
                setOrders(data[0]['products']);
                setLoading(false);
            })
            .catch(error => console.log({ error }))
    }, [currentUser]);

    useEffect(() => {
        const subtotal = orders.reduce((acc, prod, id) => acc + (amounts[id] * prod.product_details.price), 0);
        setSubtotal(subtotal);
    }, [amounts, orders]);
    if (loading) {
        return (
            <div className="container">
                <div className="row vh-100">
                    <div className="col-12 d-flex justify-content-center align-items-center h-75">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                </div>
            </div>
        )
    }

    if (!currentUser) {
        return (
            <div className="container-fluid h-100">
                <div className="row h-100 justify-content-center">
                    <div className="col-10">
                        <h1 className="text-center"><Link className="text-black" to={"/login"}>Log in</Link> to see the cart!</h1>
                    </div>
                </div>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="container-fluid h-100">
                <div className="row h-100 justify-content-center">
                    <div className="col-10">
                        <h1 className="text-center">Empty cart... Why don't you check our <Link className="text-black" to={"/products"}>products</Link> :D</h1>
                    </div>
                </div>
            </div>
        )
    }
    
    return (
        <div className="container-fluid h-100 my-3">
            <div className="row justify-content-center">
                <div className="col-11">
                    <table className="table">
                        <thead>
                            <tr className="text-center">
                                <th scope="col">Product</th>
                                <th scope="col">Quantity</th>
                                <th scope="col">Price</th>
                                <th scope="col">Total</th>
                                <th scope="col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                orders.length !== 0 &&
                                orders.map((prod, id) => {
                                    return (
                                        <tr key={id}>
                                            <td className="align-middle w-50">
                                                <div className="card mb-3 border-0" style={{ height: "10em" }}>
                                                    <div className="row g-0">
                                                        <div className="col-md-4">
                                                            <img src={prod['product_details']['img_path']} className="img-fluid object-fit-cover object-position-center" alt="image" />
                                                        </div>
                                                        <div className="col-md-8">
                                                            <div className="card-body">
                                                                <h5 className="card-title">{prod['product_details']['name']}</h5>
                                                                <p className="card-text">Details<i className="fa fa-circle-info ms-2" data-toggle="tooltip" title={prod['product_details']['details']}></i></p>
                                                                <p className="card-text"><small className="text-muted">{prod['product_details']['category']}</small></p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center align-middle">
                                                <Counter
                                                    order_item_id={prod['item_id']}
                                                    amount={amounts[id]}
                                                    totalAmount={prod['product_details']['amount']}
                                                    setAmounts={(newAmount) => setAmounts((prev) => ({ ...prev, [id]: newAmount }))} />
                                            </td>
                                            <td className="text-center align-middle">{prod['product_details']['price']} &euro;</td>
                                            <td className="text-center align-middle">{amounts[id] * prod['product_details']['price']} &euro;</td>
                                            <td className="text-center align-middle"><button className="btn btn-outline-danger" onClick={() => handleDelete(prod['product_details']['id'])}><i className="fa fa-trash"></i></button></td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col-10 text-end">
                    <p className="">SUBTOTAL: <span className="px-3 mx-3 border-bottom border-dark">{subtotal} &euro;</span></p>
                    <div className="w-25 ms-auto gap-3">
                        <button className="btn btn-outline-secondary w-40 me-2" onClick={() => navigate("/products")}>Keep buying!</button>
                        <button className="btn btn-outline-primary w-45" onClick={handlePay}>Pay</button>
                    </div>
                </div>
            </div>
        </div>
    )
}