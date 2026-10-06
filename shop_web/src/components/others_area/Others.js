import {useStateContext} from "../../_context/context_provider";
import styles from "../others_area/Others.module.css";
import {useHttp} from "../../_client/axios";
import {useCallback, useEffect, useState} from "react";

function Others(){
    const {error, errorMessage, errorState, loading,
        token, role, authorities,
        setError, setErrorMessage, setErrorState, setLoading, setNotification} = useStateContext();

    const [actualDate, setActualDate] = useState(null);
    const [income, setIncome] = useState(0);
    const [countType, setCountType] = useState(0);
    const [countStock, setCountStock] = useState(0);

    const getIncome = useCallback(async (data) => {
        setActualDate(data?.date ?? new Date());
        setIncome(data.income ?? 0);
    })

    const updateIncome = useCallback(async (data) => {
        if (actualDate === data?.date) {
            setIncome(0);
            setNotification(`Új munkanap: \n${formatDate(data?.date)}`);
        }
        else {
            setIncome(data?.income ?? 0);
            setNotification(`Napi bevétel: \n${data.income}`);
        }
        setActualDate(data?.date ?? new Date().toISOString());
        getCountRequest();
    })

    const getCount = useCallback(async (data) => {
        setCountType(data?.typeQuantity ?? 0);
        setCountStock(data?.stock ?? 0);
    })


    const {sendRequest: getIncomeRequest} = useHttp("orders/income", null, 'GET', null, getIncome);
    const {sendRequest: updateIncomeRequest} = useHttp("orders/income", null, 'PUT', null, updateIncome);
    const {sendRequest: getCountRequest} = useHttp("products/count", null, 'GET', null, getCount);

    useEffect(() => {
        getIncomeRequest();
        getCountRequest();
    }, [])

    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toISOString().split("T")[0];
    };

    const setNewDayEnabled = () => {
        return (
            role === "Admin" ||
            (role === "Moderator" && authorities?.setNewDay === true)
        );
    };

    const exportEnabled = () => {
        return (
            role === "Admin" ||
            (role === "Moderator" && authorities?.exportDatas === true)
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
            <div className={styles["title-div"]}>
                <h2 className={styles["title"]}>Egyéb adatok:</h2>
            </div>
            <div className={styles["others-container"]}>
                <table className={styles["others-table"]}>
                    <tbody>
                    <tr className={styles["data-row"]}>
                        <td className={styles["key-cell"]}>
                            Dátum:
                        </td>

                        <td className={styles["value-cell"]}>
                            {formatDate(actualDate)}
                        </td>
                    </tr>
                    <tr className={styles["data-row"]}>
                        <td className={styles["key-cell"]}>
                            Napi bevétel:
                        </td>

                        <td className={`${styles["value-cell"]} ${styles["valute-cell"]}`}>
                            {income}
                        </td>
                    </tr>
                    <tr className={styles["data-row"]}>
                        <td className={styles["key-cell"]}>
                            Termékek száma:
                        </td>

                        <td className={styles["value-cell"]}>
                            {countType}
                        </td>
                    </tr>
                    <tr className={styles["data-row"]}>
                        <td className={styles["key-cell"]}>
                            Készlet:
                        </td>

                        <td className={styles["value-cell"]}>
                            {countStock}
                        </td>
                    </tr>

                    </tbody>
                </table>
            </div>
            <div className={styles["operations-container"]}>
                <button className="btn btn-primary"
                        onClick={updateIncomeRequest}
                        disabled={!setNewDayEnabled()}>
                    Napi bevétel
                </button>
                <button className="btn btn-primary"
                        onClick={getIncome}
                        disabled={!exportEnabled()}>
                    Adatok exportálása
                </button>

            </div>
        </div>
    )
}

export default Others;