import {useStateContext} from "../../_context/context_provider";
import {useCallback, useEffect, useState} from "react";
import {useHttp} from "../../_client/axios";
import styles from "../orders_area/Orders.module.css";
import CartObject from "../carts_area/CartObject";
import Order from "./Order";

function Orders(){
    const {error, errorMessage, errorState, loading,
        token, role, authorities,
        setError, setErrorMessage, setErrorState, setLoading, setNotification} = useStateContext();

    const [orders, setOrders] = useState([]);
    const [focusId, setFocusId] = useState(null);

    const setFocusIndex = (index) => {setFocusId(index);};

    const [pages, setPages] = useState(0);
    const [actualPage, setActualPage] = useState(0);
    const [pageNumbers, setPageNumbers] = useState([]);

    const [searchUsername, setSearchUsername] = useState("");
    const [displayUsername, setDisplayUsername] = useState("");
    const [displayUserList, setDisplayUserList] = useState(false);
    const [foundUsers, setFoundUsers] = useState([{}]);
    const [user, setUser] = useState({});

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);

    const states = ["Pending","Waiting","Completed","Cancelled"]
    const timeranges = ["today","last_day","week","month","last_month"];

    const [orderParameters, setOrderParameters] = useState({page: 0, size: 8, userId: null, status_name: "Waiting", min: null, max: null, time_range: null});

    const getOrders = useCallback(async (data) => {
        setOrders(data?.items);
        setPages(data?.totalPages);
    })

    const getMinMax = useCallback(async (data) => {
        console.log("Min,max:");
        console.log(data);
        setMinPrice(data?.min ?? 0);
        setMaxPrice(data?.max ?? 0);
    })

    const setFoundUser = (user) => {
        setOrderParameters(prev => ({...prev, userId: user.id}))
        setDisplayUsername(user.username);
        setSearchUsername(user.username);
        setUser(user);
        setFoundUsers([{}]);
        console.log(user);
    }

    const searchUsers = useCallback(async (data) => {
        let _items = data?.items;
        setFoundUsers(_items);
        setDisplayUserList((searchUsername.trim().length > 0 && searchUsername !== displayUsername && _items.length > 0) ? true : false);
    })

    const deleteExpired = useCallback( async (data) => {
        setNotification(data);
        getOrdersRequest()
    });

    const {sendRequest: searchUsersRequest} = useHttp("users", {title: searchUsername}, 'GET', null, searchUsers);
    const {sendRequest: getOrdersRequest} = useHttp("orders", orderParameters, 'GET', null, getOrders);
    const {sendRequest: getMinMaxRequest} = useHttp("orders/incomes", null, 'GET', null, getMinMax);
    const {sendRequest: deleteExpiredRequest} = useHttp("orders/expired", null, 'DELETE', null, deleteExpired);

    useEffect(() => {
        searchUsersRequest();
    }, [searchUsername]);

    useEffect(() => {
        getOrdersRequest();
    }, [orderParameters]);

    useEffect(() => {
        if (!pages || pages <= 0) {
            setPageNumbers([]);
            return;
        }

        const visiblePages = 5;

        // No more 5 pages
        if (pages <= visiblePages) {
            setPageNumbers(
                Array.from({ length: pages }, (_, index) => index)
            );
            return;
        }

        let startPage;

        // At start of page-list
        if (actualPage <= 2) {
            startPage = 0;
        }

        //At ending of page-lis
        else if (actualPage >= pages - 3) {
            startPage = pages - visiblePages;
        }

        //At middle, actualPage = 5 -> [3, 4, 5, 6, 7]
        else {
            startPage = actualPage - 2;
        }

        setPageNumbers(
            Array.from(
                { length: visiblePages },
                (_, index) => startPage + index
            )
        );
    }, [orderParameters.page, pages, actualPage]);

    useEffect(() => {
        getMinMaxRequest();
    }, [orderParameters.time_range, orderParameters.status_name]);

    useEffect(() => {
        return () => {
            setError(null);
            setLoading(false);
            setErrorMessage('');
            setErrorState(null);
        };
    }, [setError, setLoading, setErrorMessage, setErrorState]);

    const convertTimeRangName = (timerange) => {
        switch (timerange) {
            case "today":
                return "Ma";

            case "day":
                return "Elmúlt 24 óra";

            case "last_day":
                return "Tegnap";

            case "week":
                return "Elmúlt 7 nap";

            case "month":
                return "Elmúlt hónap";

            case "last_month":
                return "Előző hónap";

            default:
                return "";
        }
    }

    const cleanExpiredEnabled = () => {
        return (
            role === "Admin" ||
            (role === "Moderator" && authorities?.cleanExpired === true)
        );
    };

    return (
        <div className={styles["main-page"]}>
            <div className={styles["options-div"]}>
                <div className={styles["main-filter-div"]}>
                    <div className={styles["users-div"]}>
                        <div className={styles["userform-container"]}>
                            <label className={styles["user-title"]} htmlFor="user-controll">
                                Felhasználó:
                            </label>

                            <div className={`${styles["user-searchbox"]} ${displayUserList ? styles["active"] : ""}`}>
                                <input className={styles["user-input"]} id="user-controll"
                                       type="text"
                                       placeholder="Felhasználó neve"
                                       value={searchUsername}
                                       onChange={(e) => setSearchUsername(e.target.value)}
                                />

                                <a className={styles["search-icon"]}><i className="fa fa-search"/></a>

                                <div className={styles["user-search-list"]}>
                                    <ul className={styles["user-search-ul"]}>
                                        {foundUsers.map((user, index) => (
                                            <li
                                                key={user?.id ?? index}
                                                className={styles["user-search-li"]}
                                                onClick={() => setFoundUser(user)}
                                            >
                                                {user?.username ?? ""}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles["others-div"]}>
                        <div className={styles["otherform-container"]}>

                            <label className={styles["timerange-title"]} htmlFor="timerange">
                                Intervallum:
                            </label>

                            <select
                                id="timerange"
                                className={styles["timerange-select"]}
                                value={orderParameters.time_range ?? ""}
                                onChange={(e) => {
                                    setOrderParameters(prev => ({
                                        ...prev,
                                        time_range: e.target.value || null
                                    }));
                                }}
                            >
                                <option
                                    className={`${styles["timerange-option"]} ${
                                        orderParameters.time_range == null
                                            ? styles["active"]
                                            : ""
                                    }`}
                                    value=""
                                >
                                    -
                                </option>

                                {timeranges.map(timerange => (
                                    <option key={timerange}
                                            className={`${styles["timerange-option"]} ${orderParameters.time_range === timerange ? styles["active"] : ""}`}
                                            value={timerange}
                                    >
                                        {convertTimeRangName(timerange)}
                                    </option>
                                ))}
                            </select>

                            <label className={styles["price-title"]}>
                                Bevétel:
                            </label>

                            <div className={styles["price-div"]}>
                                <div className={styles["min-price-div"]}>
                                    <label htmlFor="min-price">Min:</label>

                                    <input type="number" id="min-price" className={styles["price-input"]} value={minPrice ?? ""}
                                           onChange={(e) => {
                                               const value = e.target.value === "" ? "" : Number(e.target.value);
                                               if (Number(e.target.value) <= maxPrice) {
                                                   setMinPrice(value);
                                                   setOrderParameters(prev => ({...prev, min: value}));
                                               }
                                           }}
                                    />
                                </div>

                                <div className={styles["max-price-div"]}>
                                    <label htmlFor="max-price">Max:</label>

                                    <input type="number" id="max-price" className={styles["price-input"]}
                                           value={maxPrice ?? ""}
                                           onChange={(e) => {
                                               const value = e.target.value === "" ? "" : Number(e.target.value);
                                               if (Number(e.target.value) >= minPrice) {
                                                   setMaxPrice(value);
                                                   setOrderParameters(prev => ({...prev, max: value}));
                                               }
                                           }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className={`${styles["status-container"]}`}>
                    <div className={styles["status-div"]}>
                        {states.map((value) => {
                            const id = `status-${value}`;
                            return (
                                <div className={styles["radio-div"]} key={value}>
                                    <label htmlFor={id}>{value}:</label>

                                    <input id={id} name="order-status" type="radio"
                                           value={value} checked={orderParameters.status_name === value}
                                           onChange={(e) =>
                                               setOrderParameters((prev) =>({...prev, status_name: e.target.value}))}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className={`${styles["pagesize-div"]}`}>
                    <label className={`${styles["option-label"]}`} htmlFor="pagesize-option">Termék/oldal:</label>
                    <input type="number" className={`${styles["pagesize-input"]}`} id="pagesize-option"
                           value={orderParameters.size}
                           onChange={event => {
                               setOrderParameters((prev) => ({
                                   ...prev,
                                   page: 0,
                                   size: event.target.value
                               }));
                           }}
                    />
                </div>
            </div>

            <hr/>
            <div className={`${styles["pages-row"]}`}>
                <div className={`${styles["pages-select"]}`}>
                    {pageNumbers.map(pageNumber =>
                        (
                            <button className={`${styles["page-point"]} 
                                                    ${(pageNumber == actualPage) ? styles["active"] : ""}`}
                                    onClick={() => {
                                        setOrderParameters((prev) => ({
                                            ...prev,
                                            page: pageNumber,
                                        }));
                                        setActualPage(pageNumber);
                                    }}
                                    disabled={pageNumber == actualPage}/>
                        )
                    )}
                </div>
            </div>
            <div className={`${styles["order-operations-div"]}`}>
                <button className="btn btn-dark btn-sm"
                        onClick={() => deleteExpiredRequest()}
                        disabled={!cleanExpiredEnabled()}
                >
                    Lejárt rendelések törlése
                </button>
            </div>
            <div className={`${styles["orders-div"]}`}>
                {!loading && !error && orders.map((order) => (
                    <Order key={order.id} order={order} focusId={focusId} cancelOrder={getOrdersRequest} setFocusIndex={setFocusIndex} />
                ))}
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
        </div>
    )
}

export default Orders;