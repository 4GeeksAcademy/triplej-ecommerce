import { useEffect, useState } from "react";

export const Counter = ({ order_item_id, amount, totalAmount, setAmounts }) => {
    const [counter, setCounter] = useState(amount);

    const update_amount = () => {
        fetch('/my-cart', {
            method: "PUT",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ counter, order_item_id })
        })
            .then(resp => resp.json())
            .then(data => console.log(data))
            .catch(e => console.log(e));
    }

    const handleButton = (e) => {
        switch (e.currentTarget.id) {
            case "minus": {
                let newAmount = amount - 1;
                setCounter(newAmount);
                setAmounts(newAmount)
                break;
            }
            case "plus": {
                let newAmount = amount + 1;
                setCounter(newAmount);
                setAmounts(newAmount)
                break;
            }
        }
    }

    useEffect(() => {
        update_amount()
    }, [counter])

    return (
        <div className="d-flex justify-content-center align-items-center">
            <button
                className="btn btn-outline-secondary"
                id="minus"
                onClick={handleButton}
                disabled={counter == 1}>
                <i className="fa-solid fa-minus"></i>
            </button>
            <span className="d-inline-block" style={{ width: "4ch" }}>{counter}</span>
            <button
                className="btn btn-outline-secondary"
                id="plus"
                onClick={handleButton}
                disabled={counter == totalAmount}>
                <i className="fa-solid fa-plus"></i>
            </button>
        </div>
    )
}