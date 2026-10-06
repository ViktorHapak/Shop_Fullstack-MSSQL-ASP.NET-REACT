import {useStateContext} from "../../_context/context_provider";
import {useCallback, useEffect, useState} from "react";
import {useHttp} from "../../_client/axios";
import styles from "../admin/AdminPanel.module.css";

function AdminPanel() {

    const {error, errorState, loading, notification,
        user, parameters, token, role, authorities,
        setError, setErrorMessage, setLoading, setAuthorities, setNotification} = useStateContext();

    const [touched, setTouched] = useState(false);
    const [touchedFields, setTouchedFields] = useState({});

    const writeAuthorities = useCallback(async (data) => {
        console.log("Authorities: ", data);

        const changedFields = Object.entries(touchedFields)
            .map(([key, value]) =>
                `${key}: ${value ? "engedélyezve" : "letiltva"}`
            ).join("\n");

        setNotification(
            `Jogosultságok módosítva!\n${changedFields}`
        );

        setAuthorities(data);
        setTouched(false);
        setTouchedFields({});
    })

    const {sendRequest: writeAuthoritiesRequest} = useHttp("auth/authorities", null, 'POST', authorities, writeAuthorities);

    useEffect(() => {
        setTouched(false);
        setTouchedFields({});
    }, []);

    useEffect(() => {
        return () => {
            setError(null);
            setLoading(false);
            setErrorMessage('');
            setErrorState(null);
        };
    }, [setError, setLoading, setErrorMessage, setErrorState]);

    return (
        <div className={styles["adminpanel-container"]}>
            <div className={styles["title-div"]}>
                <h2 className={styles["title"]}>Moderátori jogosultságok:</h2>
            </div>
            {authorities && (
                <div className={styles["authorities-container"]}>
                    <table className={styles["authorities-table"]}>
                        <tbody>
                        {Object.entries(authorities).map(([key, value]) => (
                            <tr key={key} className={styles["authorities-row"]}>
                                <td className={styles["authorities-key"]}>
                                    {key}
                                </td>

                                <td className={styles["authorities-value"]}>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(value)}
                                        onChange={(e) => {
                                            setAuthorities(prev => ({
                                                ...prev,
                                                [key]: e.target.checked
                                            }));

                                            setTouched(true);
                                            setTouchedFields(prev => ({
                                                ...prev,
                                                [key]: e.target.checked
                                            }))
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="d-flex m-4 g-1 justify-content-end">
                <button className="btn btn-warning w-50 fw-bold"
                        disabled={!touched}
                        onClick={() => writeAuthoritiesRequest()}>
                    Módosítás
                </button>
            </div>
        </div>
    )



}

export default AdminPanel;
