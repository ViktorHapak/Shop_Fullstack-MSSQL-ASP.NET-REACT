import styles from './Users.module.css';
import {useStateContext} from "../../_context/context_provider";
import {useCallback, useEffect, useState} from "react";
import {useHttp} from "../../_client/axios";
import User from "./User";

function Users() {

    const {error, errorMessage, errorState, loading,
        token, role, authorities,
        setError, setErrorMessage, setErrorState, setLoading, setNotification} = useStateContext();

    const [users, setUsers] = useState([]);
    const [user, setUser] = useState({});
    const [ownuser, setOwnUser] = useState({});
    const [focusId, setFocusId] = useState(0);

    const [pages, setPages] = useState(0);
    const [actualPage, setActualPage] = useState(0);
    const [pageNumbers, setPageNumbers] = useState([]);

    const roles = ["Visitor","Moderator","Admin"]

    const [userParameters, setUserParameters] = useState({page: 0, size: 8, title: null, role: null});

    const getUsers = useCallback(async (data) => {
        setUsers(data?.items);
        setPages(data?.totalPages);
    })

    const fetchOwnUser = useCallback((data) => {
        setOwnUser({
            username: data?.Username,
            email: data?.Email,
            role: data?.Role
        });
    }, []);

    const {sendRequest: getUsersRequest} = useHttp("users", userParameters, 'GET', null, getUsers);
    const {sendRequest: fetchOwnUserRequest} = useHttp(`auth`, null, "GET", null, fetchOwnUser);

    useEffect(() => {
        getUsersRequest();
    }, [userParameters]);

    useEffect(() => {
        fetchOwnUserRequest();
    }, [])

    useEffect(() => {
        setUserParameters(prev => ({
            ...prev,
            page: 0
        }));
    }, [userParameters.title, userParameters.role]);

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
    }, [userParameters.page, pages, actualPage]);

    useEffect(() => {
        return () => {
            setError(null);
            setLoading(false);
            setErrorMessage('');
            setErrorState(null);
        };
    }, [setError, setLoading, setErrorMessage, setErrorState]);

    const deleteUser = async (id) => {
        try{
            const _noticification = await fetch(
                `http://localhost:5167/api/users/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error: ${res.status}`);
                    }

                    //setItems(null);
                    else return `Felhasználó eltávolítva: \n${res.data?.user ?? ""}`;
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
            await getUsersRequest();

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);

        }
    }

    const deleteUserEnabled = (_username) => {
        return (
            (role === "Admin" || (role === "Moderator" && authorities?.deleteUser === true))
            && (_username !== (ownuser?.username ?? ""))
        );
    };

    return (
         <div className={`${styles["main-page"]}`}>
             <div className={`${styles["userlist-div"]}`}>
                 <div className={`${styles["pages-row"]}`}>
                     <div className={`${styles["pages-select"]}`}>
                         {pageNumbers.map(pageNumber =>
                             (
                                 <button className={`${styles["page-point"]} 
                                                    ${(pageNumber == actualPage) ? styles["active"] : ""}`}
                                         onClick={() => {
                                             setUserParameters((prev) => ({
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
                 {!error && !loading && users.length > 0 && (
                     <div className={styles["users-container"]}>
                         <table className={styles["users-table"]}>
                             <tbody>
                             {users.map((user) => (
                                 <tr key={user.id} className={styles["user-row"]}>
                                     <td className={styles["username-td"]}>
                                         {user?.username ?? ""}
                                     </td>

                                     <td className={styles["operations-td"]}>
                                         <div className={`${styles["operations-container"]}`}>
                                             <button
                                                 type="button"
                                                 className="btn btn-danger btn-sm fw-bold"
                                                 onClick={() => {deleteUser(user.id)}}
                                                 disabled={!deleteUserEnabled(user?.username ?? "")}
                                             >
                                                 <i className="fa fa-minus" />
                                             </button>
                                             <button
                                                 type="button"
                                                 className="btn btn-primary btn-sm fw-bold"
                                                 onClick={() => {setFocusId(user.id);setUser(user)}}
                                             >
                                                 <i className="fa fa-info" />
                                             </button>
                                         </div>
                                     </td>
                                 </tr>
                             ))}
                             </tbody>
                         </table>
                     </div>
                 )}
                 {(loading || !users) && !error &&
                     (<div className={`${styles["loading-container"]}`}>
                            <span className={`${styles["loading-title"]}`}>
                                <label>Loading</label>
                                <label className={`${styles["dot-first"]}`}>.</label>
                                <label className={`${styles["dot-second"]}`}>.</label>
                                <label className={`${styles["dot-third"]}`}>.</label>
                            </span>
                     </div>)
                 }
                 {!loading && !error && users?.length === 0 && (
                     <div className={styles["empty-message"]}>
                         Üres rendeléslista!
                     </div>
                 )}
                 {!loading && error && (
                     (errorState === 500 || errorMessage.length < 2) ?
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
             <div className={styles["options-div"]}>
                 <div className={styles["userform-container"]}>
                     <label className={styles["user-title"]} htmlFor="user-controll">
                         Felhasználónév:
                     </label>

                     <div className={`${styles["user-searchbox"]}`}>
                         <input className={styles["user-input"]} id="user-controll"
                                type="text"
                                placeholder="Felhasználó neve"
                                value={userParameters.title}
                                onChange={(e) => setUserParameters((prev) => ({...prev, title: e.target.value}))}
                         />

                         <button className={styles["search-icon"]}><i className="fa fa-search"/></button>
                     </div>
                 </div>
                 <div className={styles["role-container"]}>
                     <div className={styles["role-div"]}>
                         {roles.map((value) => {
                             const id = `role-${value}`;
                             return (
                                 <div className={styles["radio-div"]} key={value}>
                                     <label htmlFor={id}>{value}:</label>

                                     <input id={id} name="role" type="radio"
                                            value={value} checked={userParameters.role === value}
                                            onChange={(e) =>
                                                setUserParameters((prev) =>({...prev, role: e.target.value}))}
                                     />
                                 </div>
                             );
                         })}
                     </div>
                 </div>
                 <div className={`${styles["pagesize-div"]}`}>
                     <label className={`${styles["option-label"]}`} htmlFor="pagesize-option">Termék/oldal:</label>
                     <input type="number" className={`${styles["pagesize-input"]}`} id="pagesize-option"
                            value={userParameters.size}
                            onChange={event => {
                                setUserParameters((prev) => ({
                                    ...prev,
                                    page: 0,
                                    size: event.target.value
                                }));
                            }}
                     />
                 </div>
                 {focusId !== 0 && (
                     <User id={focusId} user={user} ownuser={ownuser}></User>
                 )}
             </div>

         </div>
    )
}

export default Users
