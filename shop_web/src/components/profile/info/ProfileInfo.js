import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-svg-core';
import '@fortawesome/react-fontawesome';
import styles from "../../profile/info/ProfileInfo.module.css";
import emptyImageUrl from '../../../assets/user.webp';
import {useForm} from "react-hook-form";
import {useCallback, useContext, useEffect, useState} from "react";
import {useStateContext} from "../../../_context/context_provider";
import {useHttp} from "../../../_client/axios";
import {useNavigate} from "react-router";

function ProfileInfo() {

    const {token, role, error, errorState, loading, demoMode,
            setError, setLoading, setErrorMessage, setErrorState} = useStateContext();
    const [user, setUser] = useState({});

    const navigate = useNavigate();

    const fetchUser = useCallback((data) => {
        setUser(data);
    }, []);

    const {sendRequest} = useHttp(`auth`, null, "GET", null, fetchUser);

    useEffect(() => {
        if (demoMode){
            loadingInDemoMode();
            setUser({
                Username: "anonymus",
                Email: "anonymous@mail.com",
                Birth: new Date(),
                Role: "anonymous",
                Authentication: "username",
                Password: encodeDemoPassword("Anonim123..."),
                Token: token,
            })
        } else {
            sendRequest()
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

    useEffect(() => {
        if (errorState === 401 && error) {
            navigate('/main/profile/login');
        }
    }, [errorState]);

    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toISOString().split("T")[0];
    };

    //Just for anonymous mode - normally, we gets encoded password from the server
    const encodeDemoPassword = async (password) => {
        const data = new TextEncoder().encode(password);

        const hashBuffer = await crypto.subtle.digest(
            'SHA-256',
            data
        );

        const hashArray = Array.from(new Uint8Array(hashBuffer));

        return hashArray
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
    };

    const  loadingInDemoMode = async () => {
        if (demoMode) {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
            }, 1000)
        }
    }

    return (
         <div className="userdetails-container">
             <div className={styles["title-div"]}>
                 <h2 className={styles["title"]}>Felhasználói adatok</h2>
             </div>
             <div className={styles["img-div"]}>
                 <img className={styles["empty-img"]} src={emptyImageUrl}></img>
             </div>
             <hr/>
             {loading  &&
                 (<div className={`${styles["loading-container"]}`}>
                            <span className={`${styles["loading-title"]}`}>
                                <label>Loading</label>
                                <label className={`${styles["dot-first"]}`}>.</label>
                                <label className={`${styles["dot-second"]}`}>.</label>
                                <label className={`${styles["dot-third"]}`}>.</label>
                            </span>
                 </div>)
             }
             {!loading && !error && user &&
                (<div className={styles["details-container"]}>
                    <table className={styles["profile-table"]}>
                     <tbody>
                      <tr>
                          <td align={"left"} className={styles["key-cell"]}>Felhasználónév:</td>
                          <td align={"right"} className={styles["value-cell"]}> {user.Username || ""}</td>
                      </tr>
                      <tr>
                          <td align={"left"} className={styles["key-cell"]}>Email:</td>
                          <td align={"right"} className={styles["value-cell"]}> {user.Email || ""}</td>
                      </tr>
                      <tr>
                          <td align={"left"} className={styles["key-cell"]}>Szül. dátum:</td>
                          <td align={"right"} className={styles["value-cell"]}> {formatDate(user.Birth)}</td>
                      </tr>
                      <tr>
                          <td align={"left"} className={styles["key-cell"]}>Jogosultság:</td>
                          <td align={"right"} className={styles["value-cell"]}> {user.Role || ""}</td>
                      </tr>
                      <tr>
                          <td align={"left"} className={styles["key-cell"]}>Autentikáció típusa:</td>
                          <td align={"right"} className={styles["value-cell"]}> {user.Authentication || ""}</td>
                      </tr>
                      <tr>
                          <td align={"left"} colSpan={2} className={styles["key-longcell"]}>Kódolt jelszó:</td>
                      </tr>
                      <tr>
                          <td align={"right"} colSpan={2} className={styles["value-longcell"]}> {user.Password || ""}</td>
                      </tr>
                      <tr>
                          <td align={"left"} colSpan={2} className={styles["key-longcell"]}>Token:</td>
                      </tr>
                      <tr>
                          <td align={"right"} colSpan={2} className={styles["value-longcell"]}> {user.Token || ""}</td>
                      </tr>
                     </tbody>
                    </table>
                 </div>)
             }
             {!loading && ((errorState === 500) || !user ) && (
                 <div className="alert alert-warning d-block mx-5 m-3">
                     Szerver hiba!
                 </div>
             )}
         </div>
    )
}

export default ProfileInfo;