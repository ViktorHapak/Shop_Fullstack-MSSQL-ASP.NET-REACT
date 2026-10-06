import {useCallback, useEffect, useState} from "react";
import styles from "./OwnOrders.module.css";
import {useStateContext} from "../../_context/context_provider";
import {useHttp} from "../../_client/axios";
import Order from "./OwnOrder";

function OwnOrders() {
    const {token, loading, error, errorMessage, errorState, demoMode, demoCart, demoOrder,
        setLoading, setError, setErrorMessage, setErrorState, setNotification,setDemoOrder} = useStateContext();
    const [orders, setOrders] = useState([]);
    const [status, setStatus] = useState(demoMode ? "Pending" : "Waiting")
    const [edit, setEdit] = useState(null);

    const states = ["Pending","Waiting","Completed","Cancelled"]

    const getOrders = useCallback(async (data) => {
        setOrders(data);
    })

    const {sendRequest: getOrdersRequest} = useHttp("orders/own", {status: status}, 'GET', null, getOrders);


    useEffect(() => {
        if (demoMode) {
            setOrders((status === "Pending" && demoCart.items.length > 0) ? [structuredClone(demoOrder)] : []);
        } else {
            getOrdersRequest();
        }
    }, [status])

    useEffect(() => {
        if (demoMode) {
            //setLoading(true);
            loadingInDemoMode();
            if (demoCart.items.length > 0) {
                let _items = demoCart.items
                    .map(_item => {
                            return {id: _item.id, productName: _item.product, quantity: _item.quantity, totalPrice: _item.totalPrice}
                        }
                    );

                let _order = {
                    id: 1,
                    customerUsername: "anonymus",
                    status: 0,
                    createdAt: new Date(),
                    submittedAt: null,
                    items: _items,
                    totalPrice: demoCart.items.reduce((sum, item) => sum + item.totalPrice, 0)
                }

                setDemoOrder(structuredClone(_order));
                setOrders([structuredClone(_order)]);

            } else
                setOrders([]);

            //setLoading(false);
        }
    }, []);

    useEffect(() => {
        return () => {
            setError(null);
            setLoading(false);
            setErrorMessage('');
            setErrorState(null);
        };
    }, [setError, setLoading, setErrorMessage, setErrorState]);

    const setEditIndex = (index) => {setEdit(index);};

    const  loadingInDemoMode = async () => {
        if (demoMode) {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
            }, 1000)
        }
    }

    return (
         <div className={`${styles["orders-container"]}`}>
             <div className={styles["title-div"]}>
                 <h2 className={styles["title"]}>Rendelések:</h2>
             </div>
             <div className={styles["status-div"]}>
                 {states.map((value) => {
                     const id = `status-${value}`;
                     return (
                         <div className={styles["radio-div"]} key={value}>
                             <label htmlFor={id}>
                                 {value}:
                             </label>

                             <input
                                 id={id}
                                 name="order-status"
                                 type="radio"
                                 value={value}
                                 checked={status === value}
                                 onChange={(e) => setStatus(e.target.value)}
                             />
                         </div>
                     );
                 })}
             </div>
             {(loading || !orders) && !error &&
                 (<div className={`${styles["loading-container"]}`}>
                            <span className={`${styles["loading-title"]}`}>
                                <label>Loading</label>
                                <label className={`${styles["dot-first"]}`}>.</label>
                                <label className={`${styles["dot-second"]}`}>.</label>
                                <label className={`${styles["dot-third"]}`}>.</label>
                            </span>
                 </div>)
             }
             {!loading && !error && orders &&
                 (
                     <div className={`${styles["orders-div"]}`}>
                         {orders.map((order, index) => (
                             <Order key={index} order={order} edit={edit} cancelOrder={getOrdersRequest} setEditIndex={setEditIndex} />
                         ))}
                     </div>
                 )
             }
             {!loading && !error && orders?.length === 0 && (
                 <div className={styles["empty-message"]}>
                     Üres rendeléslista!
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
    )
}

export default OwnOrders