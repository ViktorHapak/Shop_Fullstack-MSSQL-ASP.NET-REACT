import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-svg-core';
import '@fortawesome/react-fontawesome';
import styles from "./CartContent.module.css";
import {Outlet, useNavigate} from "react-router";
import {useCallback, useEffect, useState} from "react";
import {useHttp} from "../../_client/axios";
import {useStateContext} from "../../_context/context_provider";

function CartContent() {

    const {token, loading, error, errorMessage, errorState, demoMode, demoCart,
            products, setLoading, setError, setErrorMessage, setErrorState, setNotification, setDemoCart} = useStateContext();
    const [cart, setCart] = useState(null);
    const [items, setItems] = useState([]);
    const [focusIndex, setFocusIndex] = useState(null);

    const navigate = useNavigate();

    const getCart = useCallback(async (data) => {
        console.log(data);
        try {
            const items = await Promise.all(
                (data?.items ?? []).map(async (item) => {

                    const product = await fetch(`http://localhost:5167/api/products/${item.productId}`)
                        .then(res => {
                            if (!res.ok) {
                                throw new Error(`HTTP error: ${res.status}`);
                            }

                            return res.json();
                        })
                        .catch(err => {
                            setError(err);
                            setErrorMessage(`Nem sikerült betölteni a terméket: ${item.productId}`);
                            return null;
                        });

                    //const response = await fetch(`http://localhost:5167/api/products/${item.productId}`);

                    console.log(product);

                    return {
                        ...item,
                        product: product.name || ""
                    };
                })
            );

            const _cart = {
                totalPrice: data?.totalPrice ?? 0,
                createdAt: data?.createdAt ?? new Date(),
                items: items
            };

            setCart(_cart);
            setItems(items);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const makeOrder = useCallback(async (data) => {
        console.log(data);
        setNotification(`Rendelés leadva! \n Fizetendő: ${cart.totalPrice} Ft`);
        getCartRequest();
    })

    const {sendRequest: getCartRequest} = useHttp("carts/own", null, 'GET', null, getCart, true);
    const {sendRequest: makeOrderRequest} = useHttp("orders/order", null, 'POST', null, makeOrder, true);

    useEffect(() => {
        if (demoMode){
            setCart(structuredClone(demoCart));
            setItems(structuredClone(demoCart?.items));
        } else {
            getCartRequest();
        }
    }, [getCartRequest]);

    useEffect(() => {
        return () => {
            setError(null);
            setLoading(false);
            setErrorMessage('');
        };
    }, []);

    useEffect(() => {
        if (errorState === 401 && error) {
            navigate('/main/profile/login');
        }
    }, [errorState]);

    const removeProduct = async (productId, productName) => {
        try{
            const _noticification = await fetch(
                `http://localhost:5167/api/carts/remove=${productId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                    .then(res => {
                        if (!res.ok) {
                            throw new Error(`HTTP error: ${res.status}`);
                        }

                        //setItems(null);

                        if (res.status === 204) return "Üres bevásárlólista";
                        else return `Termék törölve a listából: \n${productName}`;
                    })
                    .catch(err => {
                        setError(err)
                        setErrorState(error.response.status);
                        let _errorMessage = error.response.data?.message ?? error.response.data?.error ??
                            error.response.data ?? error.message;

                        setErrorMessage(`${_errorMessage}`);
                        setLoading(false);
                    });

            if (_noticification && !error) setNotification(_noticification);
            await getCartRequest();

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);

        }

    }

    useEffect(() => {
        return () => {
            setError(null);
            setLoading(false);
            setErrorMessage('');
            setErrorState(null);
        };
    }, [setError, setLoading, setErrorMessage, setErrorState]);

    const makeDemoRequest = () => {
        const emptyCart = {
            items: [],
            totalPrice: 0
        };

        setItems([]);
        setDemoCart(emptyCart);
        setCart(emptyCart);

        setNotification("A rendelés nem került rögzítésre demo módban!");
    };

    const removeDemoProduct =  (productId, productName) => {

        let updatedItems;
        const item = demoCart.items.find(item => item.id === productId);

        if (!item) {
            return;
        }

        if (item.quantity > 1) {
            updatedItems = demoCart.items.map(item =>
                item.id === productId ? {
                        ...item,
                        quantity: item.quantity - 1,
                        totalPrice: (item.quantity - 1) * (item.totalPrice / item.quantity)
                    } : item
            );
        } else {
            updatedItems = demoCart.items.filter(item => item.id !== productId);
        }

        const totalPrice = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);

        setDemoCart({
            items: updatedItems,
            totalPrice: totalPrice
        });

        setCart({
            items: updatedItems,
            totalPrice: totalPrice
        });

        setItems(updatedItems);

        setNotification(`Termék törölve a listából: \n${productName}`);
    }

    return (
        <div className={styles["cart-container"]}>
            <div className={styles["title-div"]}>
                <h2 className={styles["title"]}>Bevásárlókosár tartalma:</h2>
            </div>
            {(loading || !cart) && !error &&
                (<div className={`${styles["loading-container"]}`}>
                            <span className={`${styles["loading-title"]}`}>
                                <label>Loading</label>
                                <label className={`${styles["dot-first"]}`}>.</label>
                                <label className={`${styles["dot-second"]}`}>.</label>
                                <label className={`${styles["dot-third"]}`}>.</label>
                            </span>
                </div>)
            }
            {!loading && !error && cart &&(
                <div className={styles["cards-container"]}>
                    {items.map((item, index) => (
                        <div key={`${item.productId}-${index}`} className="card mb-3 g-1"
                            style={{ position: "relative" }}
                             onMouseEnter={() => setFocusIndex(index)}
                             onMouseLeave={() => setFocusIndex(null)}
                        >
                            {focusIndex === index && (
                                <button
                                    type="button"
                                    className={`btn btn-danger ${styles["close-btn"]}`}
                                    onClick={() => demoMode ? removeDemoProduct(item.id, item.product) : removeProduct(item.productId, item.product)}
                                >
                                    X
                                </button>
                            )}

                            <div className="card-header bg-primary text-white text-end fw-bold">Id: {item.id}</div>

                            <div className="card-body p-1">
                                <div className="row g-1">

                                    <div className="col-4">
                                        <div className="bg-info p-2 h-100 fw-semibold">
                                            Terméknév: <div className="fw-bold">{item.product || "-"}</div>
                                        </div>
                                    </div>

                                    <div className="col-4">
                                        <div className="bg-info p-2 h-100 fw-semibold">
                                            Mennyiség: <div className="fw-bold">{item.quantity ?? "-"}</div>
                                        </div>
                                    </div>

                                    <div className="col-4">
                                        <div className="bg-info p-2 h-100 fw-semibold">
                                            Ár: <div className="fw-bold">{item.totalPrice ?? "-"} Ft</div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}

                    {!loading && ((errorState !== 500)) && items.length === 0 && (
                        <div className={styles["empty-message"]}>
                            Üres bevásárlólista!
                        </div>
                    )}
                </div>
            )}
            <div className="card mt-2" style={{ width: '90%', margin: '0 auto' }}>
                <div className="card-body bg-light py-2 text-end fw-bold">
                    Összesen: {cart?.totalPrice ?? 0} Ft
                </div>
            </div>
            <div className="d-flex m-4 mb-3 g-1 justify-content-center">
                <button className="btn btn-success w-75 py-2 fw-bold"
                        disabled={loading || error || items.length<1}
                        onClick={() => demoMode ? makeDemoRequest() :
                            makeOrderRequest()
                        }
                >
                    Rendelés leadása
                </button>
            </div>
            {!loading && error && (errorState !== 500) &&
                (
                    (errorMessage.length < 2)  ?
                        (
                            <div className="alert alert-warning d-block mx-5 m-3">
                                Szerver hiba!
                            </div>
                        ) : (
                            <div className="alert alert-danger d-block mx-5 m-3">
                                {errorMessage}
                            </div>
                        )
                )
            }
            {!loading && (errorState === 500) &&
            (
                    <div className="alert alert-warning d-block mx-5 m-3">
                        Szerver hiba!
                    </div>

            )
            }

        </div>
    )
}

export default CartContent;