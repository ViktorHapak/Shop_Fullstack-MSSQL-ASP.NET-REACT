import {memo, useCallback, useContext, useEffect, useState} from "react";
import styles from './ProductCard.module.css';
import {useHttp} from "../../_client/axios";
import {useStateContext} from "../../_context/context_provider";
import {useNavigate} from "react-router";
import {set} from "react-hook-form";
import carts from "../carts_area/Carts";


function ProductCard(props) {

    const id = props.product.id ?? null;

    const {notification, token, role, error, errorState, categories,
            demoMode, demoProducts, demoCart,
            setNotification, setDemoCart} = useStateContext();

    const [productToEdit, setProductToEdit] = useState(props.product);

    const addToCart = useCallback(async data => {
        setNotification(`Termék hozzáadva a bevásárlólistához: \n${props.product.name}`)
    }, []);

    const updateProduct = useCallback(async data => {
        setNotification(`Termék adatai módosítva: \n${data?.name || ""}`)
        props.setEditId(0);
        props.getProducts();
    }, []);

    const increaseStock = useCallback(async data => {
        setNotification(`Készlet növelve! \n${data?.product || ""}\nMennyiség: ${data?.quantity || ""}`);
        props.setEditId(0);
        props.getProducts();
    })

    const reduceStock = useCallback(async data => {
        setNotification(`Készlet csökkentve! \n${data?.product || ""}\nMennyiség: ${data?.quantity || ""}`);
        props.setEditId(0);
        props.getProducts();
    })

    const deleteProduct = useCallback(async data => {
        setNotification(`Termék törölve: \n${props?.product?.name ?? ""}`)
        props.setEditId(0);
        props.getProducts();
    })

    const {sendRequest: addToCartRequest} = useHttp(`carts/add=${props.product.id}`, null, 'POST', null, addToCart);
    const {sendRequest: updateProductRequest} = useHttp(`products/${id}`, null, 'PUT', productToEdit, updateProduct);
    const {sendRequest: increaseStockRequest} = useHttp(`products/stock/${id}`, {operation: "inc", quantity: 1}, 'PUT', null, increaseStock);
    const {sendRequest: reduceStockRequest} = useHttp(`products/stock/${id}`, {operation: "red", quantity: 1}, 'PUT', null, reduceStock);
    const {sendRequest: deleteProductRequest} = useHttp(`products/${id}`, null, 'DELETE', null, deleteProduct);

    const addToDemoCart = () => {
        const _demoCart = structuredClone(demoCart);
        let _item = _demoCart.items.find(item => item.product == props.product.name);

        if (_item) {
            _item.quantity++;
            _item.totalPrice = _item.quantity * props.product.price;
        } else {
            _demoCart.items.push({id: props.product.id, product: props.product.name, quantity: 1, totalPrice: props.product.price});
        }

        //Summarizing the cart's contant summarized value
        _demoCart.totalPrice = _demoCart.items.reduce(
            (sum, item) => sum + item.totalPrice,
            0
        );

        console.log(_demoCart);

        setDemoCart(_demoCart);
        setNotification(`Termék hozzáadva a bevásárlólistához: \n${props.product.name}`)
    }

    useEffect(() => {
        setProductToEdit(props.product);
    }, [props.editId])

    if (!props.product) {
        return null;
    }


    /*
    useEffect(() => {
        const _productResource = productImgs.find((item) => item.id === id);
    }, [id]);
     */

    return (
        <article className="card-container">
            <div className={`${styles["img-container"]}`}>
                {props.editId === props.product.id && (
                    <button className={`${styles["close-button"]} btn btn-danger`}
                            onClick={() => props.setEditId(0)}>
                        <i className="fa fa-close" />
                    </button>
                )}
                <img src={props.product.dataUrl} alt={props.product.name} />
                {props.editId === props.product.id ? (
                    <input
                        type="number"
                        className={styles["price-input"]}
                        value={productToEdit?.price ?? ""}
                        onChange={(e) => {
                            setProductToEdit(prev => ({
                                ...prev,
                                price: e.target.value === "" ? "" : Number(e.target.value)
                            }));
                        }}
                    />
                ) : (
                    <label className={styles["price-label"]}>
                        {props.product.price}
                    </label>
                )}
            </div>
            {props.editId === props.product.id ? (
                <input
                    type="text"
                    className={styles["product-title-input"]}
                    value={productToEdit?.name ?? ""}
                    onChange={(e) => {
                        setProductToEdit(prev => ({
                            ...prev,
                            name: e.target.value
                        }));
                    }}
                />
            ) : (
                <a className={styles["product-title"]}>
                    {props.product.name}
                </a>

            )}
            {(role === "Admin" || role === "Moderator") && (
                <>
                    <div className={`${styles["stock-row"]}`}>
                        <label className={`${styles["key-label"]}`}>Készlet:</label>
                        {props.editId === props.product.id ? (
                            <input
                                type="number"
                                className={styles["stock-input"]}
                                value={productToEdit?.stock ?? ""}
                                onChange={(e) => {
                                    setProductToEdit(prev => ({
                                        ...prev,
                                        stock: e.target.value === "" ? "" : Number(e.target.value)
                                    }));
                                }}
                            />
                        ) : (
                            <label className={`${styles["value-label"]}`}>{props.product?.stock ?? ""}</label>
                        )}
                    </div>
                    <div className={`${styles["stock-loading-row"]}`}>
                        <button
                            className={`${styles["small-button"]} btn btn-success btn-sm w-25 m-1`}
                            disabled={!props.replenishStackEnabled}
                            onClick={() => {
                                increaseStockRequest()
                            }}
                        >
                            <i className="fa fa-plus" />
                        </button>
                        <button
                            className={`${styles["small-button"]} btn btn-danger btn-sm w-25 m-1`}
                            disabled={!props.reduceStackEnabled}
                            onClick={() => {
                                reduceStockRequest()
                            }}
                        >
                            <i className="fa fa-minus" />
                        </button>
                    </div>
                    <div className={`${styles["department-row"]}`}>
                        <label className={`${styles["key-label"]}`}>Részleg:</label>
                        {props.editId === props.product.id ? (
                            <select
                                className={`${styles["department-select"]}`}
                                value={productToEdit?.departmentId ?? ""}
                                onChange={(e) => {
                                    setProductToEdit(prev => ({
                                        ...prev,
                                        departmentId: Number(e.target.value)
                                    }));
                                }}
                            >
                                {categories.map((category) => (
                                    <option className={`${styles["department-option"]} ${
                                                    Number(productToEdit?.departmentId) === category.id ? styles["active"] : ""}`}
                                            value={category.id}>{category?.name ?? ""}</option>
                                ))}

                            </select>
                        ) : (
                            <label className={`${styles["value-label"]}`}>{props.product?.department ?? ""}</label>
                        )}
                    </div>
                </>
            )}
            {!token || role === "Visitor" || role === "anonymous" ? (
                <button
                    className={`${styles["product-submit"]} btn btn-success w-100 m-1`}
                    disabled={props.product.stock < 1}
                    onClick={() => demoMode ? addToDemoCart() : addToCartRequest()}
                >
                    Kosárba tesz
                </button>
            ) : (
                <>
                    {props.editId === props.product.id ? (
                        <button
                            className={`${styles["product-submit"]} btn btn-warning w-100 m-1`}
                            disabled={!props.updateProductEnabled || props.product === productToEdit}
                            onClick={() => {updateProductRequest();}}
                        >
                            Mentés
                        </button>
                    ) : (
                        <button
                            className={`${styles["product-submit"]} btn btn-primary w-100 m-1`}
                            disabled={!props.updateProductEnabled}
                            onClick={() => props.setEditId(props.product.id)}
                        >
                            Szerkesztés
                        </button>
                    )}

                    <button
                        className={`${styles["product-submit"]} btn btn-danger w-100 m-1`}
                        disabled={!props.deleteProductEnabled}
                        onClick={() => {deleteProductRequest();}}
                    >
                        Eltávolítás
                    </button>
                </>
            )}
        </article>
    )
}

export default memo(ProductCard);