import styles from './Carts.module.css';
import {useStateContext} from "../../_context/context_provider";
import {useCallback, useEffect, useState} from "react";
import {useHttp} from "../../_client/axios";
import Order from "../orders/OwnOrder";
import {c} from "react/compiler-runtime";
import CartObject from "./CartObject";

function Carts(){

    const {error, errorMessage, errorState, loading,
        token, role, authorities,
        setError, setErrorMessage, setErrorState, setLoading, setNotification} = useStateContext();

    const [searchUsername, setSearchUsername] = useState("");
    const [displayUsername, setDisplayUsername] = useState("");
    const [displayUserList, setDisplayUserList] = useState(false);
    const [foundUsers, setFoundUsers] = useState([{}]);
    const [user, setUser] = useState({});

    const [searchProductName, setSearchProductName] = useState("");
    const [displayProductName, setDisplayProductName] = useState("");
    const [foundProducts, setFoundProducts] = useState([{}]);
    const [displayProductList, setDisplayProductList] = useState(false);
    const [products, setProducts] = useState([]);

    const [focusFoundProductId, setFocusFoundProductId] = useState(0);

    const [cartParameters, setCartParameters] = useState({userId: null, productIds: null, operation: 'and'});

    const [carts, setCarts] = useState([{}]);

    const setFoundUser = (user) => {
        setCartParameters(prev => ({...prev, userId: user.id}))
        setDisplayUsername(user.username);
        setSearchUsername(user.username);
        setUser(user);
        setFoundUsers([{}]);
        console.log(user);
    }

    const setFoundProduct = (product) => {
        let _products = products.some(p => p.id === product.id) ? products : [...products, product];
        setProducts(_products)
        setCartParameters(prev => ({...prev, productIds: _products.map(_product => _product.id)}));
        setDisplayProductName(product.name)
        setSearchProductName(product.name)
        setFoundProducts([{}])
    }

    const removeFoundProduct = (product) => {
        let _products = products.filter(p => p.id !== product.id);
        setProducts(_products);
        setCartParameters(prev => ({...prev, productIds: _products.map(_product => _product.id)}));
        setFocusFoundProductId(0);
        setSearchProductName("")
    }

    const searchUsers = useCallback(async (data) => {
        let _items = data?.items;
        setFoundUsers(_items);
        setDisplayUserList((searchUsername.trim().length > 0 && searchUsername !== displayUsername && _items.length > 0) ? true : false);
    })

    const searchProducts = useCallback( async (data) => {
        let _items = data?.items;
        setFoundProducts(_items);
        setDisplayProductList((searchProductName.trim().length > 0 > 0 && searchProductName !== displayProductName && _items.length > 0) ? true : false);
        console.log(data)
    })

    const getCarts = useCallback( async (data) => {
        setCarts(data);
        console.log("Bevásárlókosarak:")
        console.log(data)
    });

    const deleteExpired = useCallback( async (data) => {
        setNotification(data);
        getCartsRequest()
    });

    const {sendRequest: searchUsersRequest} = useHttp("users", {title: searchUsername}, 'GET', null, searchUsers);
    const {sendRequest: searchProductsRequest} = useHttp("products", {title: searchProductName}, 'GET', null, searchProducts);
    const {sendRequest: getCartsRequest} = useHttp("carts", cartParameters, 'GET', null, getCarts);
    const {sendRequest: deleteExpiredRequest} = useHttp("carts/expired", null, 'DELETE', null, deleteExpired);

    useEffect(() => {
        searchUsersRequest();
    }, [searchUsername]);

    useEffect(() => {
        searchProductsRequest();
    }, [searchProductName]);

    useEffect(() => {
        getCartsRequest();
    }, [cartParameters])

    const cleanExpiredEnabled = () => {
        return (
            role === "Admin" ||
            (role === "Moderator" && authorities?.cleanExpired === true)
        );
    };

    useEffect(() => {
        return () => {
            setError(null);
            setLoading(false);
            setErrorMessage('');
            setErrorState(null);
        };
    }, [setError, setLoading, setErrorMessage, setErrorState]);
    

    return (
        <div className={styles["main-page"]}>
            <div className={`${styles["options-div"]}`}>
                <div className={`${styles["users-div"]}`}>
                    <div className={`${styles["userform-container"]}`}>
                        <label className={`${styles["user-title"]}`} htmlFor="user-control">Felhasználó:</label>
                        <div className={`${styles["user-searchbox"]} 
                                         ${displayUserList ? styles["active"] : ""}`}>
                            <input className={`${styles["user-input"]}`} id="user-controll"
                                   type="text" placeholder="Felhasználó neve"
                                   value={searchUsername}
                                   onChange={(e) => {setSearchUsername(e.target.value)}}
                            />
                            <a className={styles["search-icon"]}><i className="fa fa-search" /></a>
                                <div className={`${styles["user-search-list"]}`}>
                                    <ul className={`${styles["user-search-ul"]}`}>
                                        {foundUsers.map((user, index) => (
                                            <li className={`${styles["user-search-li"]}`}
                                                onClick={() => {setFoundUser(user)}}>
                                                    {user?.username ?? ""}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                        </div>
                    </div>
                </div>
                <div className={`${styles["products-div"]}`}>
                    <div className={`${styles["productform-container"]}`}>
                        <label className={`${styles["product-title"]}`} htmlFor="product-control">Termék:</label>
                        <div className={`${styles["product-searchbox"]} 
                                         ${displayProductList ? styles["active"] : ""}`}>
                            <input className={`${styles["product-input"]}`} id="product-controll"
                                   type="text" placeholder="Termék neve"
                                   value={searchProductName}
                                   onChange={(e) => {setSearchProductName(e.target.value)}}
                            />
                            <a className={styles["search-icon"]}><i className="fa fa-search" /></a>
                                <div className={`${styles["product-search-list"]}`}>
                                    <ul className={`${styles["product-search-ul"]}`}>
                                        {foundProducts.map((product, index) => (
                                            <li className={`${styles["product-search-li"]}`}
                                                onClick={() => {setFoundProduct(product)}}>
                                                {product?.name ?? ""}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                        </div>
                        {products.length > 0 && (
                            <div className={`${styles["found-products-container"]}`}>
                                {products.filter(product => product?.id != null)
                                    .map((product, index) => (
                                    <div className={`${styles["found-product-div"]} bg-primary`} key={index}
                                         onMouseEnter={() => setFocusFoundProductId(product.id)}
                                         onMouseLeave={() => setFocusFoundProductId(0)}
                                    >
                                        <label className={`${styles["found-product-label"]} text-white fw-bold`}>{product?.name ?? ""}</label>
                                        {focusFoundProductId === product.id && (
                                            <button className={`${styles["close-item"]}`}
                                                    onClick={() => removeFoundProduct(product)}
                                            >
                                                <i className="fa fa-close"/>
                                            </button>
                                        )}
                                    </div>
                                ))}

                            </div>
                        )}

                        <div className={`${styles["logic-div"]}`}>
                            <button className={`${styles["operation-button"]} btn btn-primary btn-sm fw-bold`}
                                    onClick={() => {
                                        cartParameters.operation === 'and' ?
                                        setCartParameters(prev => ({...prev, operation: 'or'})) :
                                        setCartParameters(prev => ({...prev, operation: 'and'}))
                                    }}
                            >
                                {cartParameters.operation}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <hr/>
            <div className={`${styles["cart-operations-div"]}`}>
                <button className="btn btn-dark btn-sm"
                        onClick={() => deleteExpiredRequest()}
                        disabled={!cleanExpiredEnabled()}
                >
                    Lejárt kosarak törlése
                </button>
            </div>
            <div className={`${styles["carts-div"]}`}>
                {!loading && !error && carts.map((cart) => (
                    <CartObject key={cart.id} cart={cart}/>
                ))}
                {(loading || !carts) && !error &&
                    (<div className={`${styles["loading-container"]}`}>
                            <span className={`${styles["loading-title"]}`}>
                                <label>Loading</label>
                                <label className={`${styles["dot-first"]}`}>.</label>
                                <label className={`${styles["dot-second"]}`}>.</label>
                                <label className={`${styles["dot-third"]}`}>.</label>
                            </span>
                    </div>)
                }
                {!loading && !error && carts?.length === 0 && (
                    <div className={styles["empty-message"]}>
                        Üres bevásárlólista!
                    </div>
                )}
                {!loading && error && (errorMessage.length > 2) && (
                    (errorState === 500) ?
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
            </div>
        </div>
    )
}

export default Carts;