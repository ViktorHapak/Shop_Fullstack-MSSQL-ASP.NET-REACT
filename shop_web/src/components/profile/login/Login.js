import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-svg-core';
import '@fortawesome/react-fontawesome';
import styles from "../../profile/register/Register.module.css";
import emptyImageUrl from '../../../assets/user.webp';
import {useForm} from "react-hook-form";
import {useCallback, useEffect, useState} from "react";
import {useStateContext} from "../../../_context/context_provider";
import {useHttp} from "../../../_client/axios";
import {useNavigate} from "react-router";

function Login() {

    let {
        register,
        getValues,
        handleSubmit,
        formState: { errors, touchedFields },
    } = useForm({ mode: 'onTouched', reValidateMode: 'onChange' });

    const [formError, setFormError] = useState({
        message: null,
        status: false,
    });

    const {error, errorMessage, errorState, notification, loading,
        token, user, role,
        setError, setErrorMessage, setErrorState, setNotification, setLoading,
        setToken, setUser, setRole, setAuthorities} = useStateContext();

    const navigate = useNavigate();

    //If username or email is filled correctly to make validation successfull
    const nameRules = {
        validate: value => {
            const email = getValues('email');

            if (email && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
                return true;
            }

            if (!value) {
                return 'Felhasználónév vagy email megadása kötelező!';
            }

            if (value.length < 5) {
                return 'Min. 5 karakter';
            }

            if (value.length > 30) {
                return 'Max. 30 karakter';
            }

            if (!/^[A-Za-z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+$/.test(value)) {
                return 'Nem megengedett karakter';
            }

            return true;
        }
    };

    const emailRules = {
        validate: value => {
            const username = getValues('username');

            const validUsername =
                username &&
                username.length >= 5 &&
                username.length <= 30 &&
                /^[A-Za-z0-9_ -]+$/.test(username);

            if (validUsername) {
                return true;
            }

            if (!value) {
                return 'Felhasználónév vagy email megadása kötelező!';
            }

            if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                return 'Érvénytelen email cím';
            }

            return true;
        }
    };

    // PASSWORD: required + min 8 + 1 lower + 1 upper + 1 digit + 1 special from .!?,;:@
    const passwordRules = {
        required: 'Kötelező mező!',
        minLength: { value: 6, message: 'Min. 6 karakter' },
        pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
            message:
                'Legalább 1 kis- és nagybetű, 1 szám megadása kötelező!',
        },
    };

    function enable(){
        const passwordOk = !errors.password && touchedFields.password;
        return (!errors.username && !errors.email && passwordOk);
    }

    const handleLogin = useCallback((data) => {
        setToken(data);
        console.log("Token: ", data);
        getUserRequest();
    }, [setToken]);

    const fetchUser = useCallback((data) => {
        console.log(data);
        setRole(data.Role);
        setNotification(
            `Bejelentkezve:\n${data.Username}\n${data.Role}`
        );

        if (data.Role === "Admin")
            getAuthoritiesRequest();

        navigate('/');
    }, [navigate, setNotification, setUser, setRole]);

    const getAuthorities = useCallback(async (data) => {
        console.log("Authorities: ",data);
        setAuthorities(data);
    }, [])

    const payload = () => {
        const username = getValues("username");
        const email = getValues("email");
        const password = getValues("password");

        const result = {password: password};

        if (
            username &&
            username.length >= 5 &&
            username.length <= 30 &&
            /^[A-Za-z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+$/.test(username)
        ) {
            result.username = username;
        }

        if (
            email &&
            /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
        ) {
            result.email = email;
        }

        return result;
    };

    const {sendRequest: loginRequest} = useHttp(`auth/login`, null, "POST", payload(), handleLogin);
    const {sendRequest: getUserRequest} = useHttp(`auth`, null, "GET", null, fetchUser);
    const {sendRequest: getAuthoritiesRequest} = useHttp("auth/authorities", null, 'GET', null, getAuthorities);

    const login = () => {
        const username = payload().username;
        const password = payload().password;

        if (username === "anonymus") {

            if (password !== "Anonim123...") {
                setError({message: "Authentication error"});
                setErrorMessage("Hibás jelszó!");
                setErrorState();
                return;
            }

            setToken("demo_token");
            setRole("anonymous");
            setNotification(`Bejelentkezve demo módban!`);

            setError(null);
            setErrorMessage("");
            setErrorState(null);

            navigate('/');

        } else
            loginRequest()
    }

    useEffect(() => {
        return () => {
            setError(null);
            setLoading(false);
            setErrorMessage('');
            setErrorState(null);
        };
    }, [setError, setLoading, setErrorMessage, setErrorState]);

    return (
         <div className="login-container">
             <div className={styles["title-div"]}>
                 <h2 className={styles["title"]}>Bejelentkezés</h2>
             </div>
             <div className={styles["img-div"]}>
                 <img className={styles["empty-img"]} src={emptyImageUrl}></img>
             </div>
             <hr/>
             <form onSubmit={handleSubmit(login)}>
                 <div className={styles["controllers-div"]}>
                     <div className={styles["name-container"]}>
                         <label htmlFor="username-control">Felhasználónév:</label>
                         <input className={styles["form-control"]} id="username-control" placeholder="Felhasználónév"
                                type="text" {...register('username', nameRules)}/>
                         {(touchedFields.username || formError.status) && errors.username &&
                             <small style={{color: 'red', whiteSpace: 'pre-line'}}
                                    className="invalid-feedback d-block text-center">{errors.username.message}</small>}
                     </div>
                     <div className={styles["email-container"]}>
                         <label htmlFor="email-control">Email:</label>
                         <input className={styles["form-control"]} id="email-control" placeholder="Email"
                                type="text" {...register('email', emailRules)}/>
                         {(touchedFields.email || formError.status) && errors.email &&
                             <small style={{color: 'red', whiteSpace: 'pre-line'}}
                                    className="invalid-feedback d-block text-center">{errors.email.message}</small>}
                     </div>
                     <div className={styles["password-container"]}>
                         <label htmlFor="password-control">Jelszó:</label>
                         <input className={styles["form-control"]} id="password-control" placeholder="Jelszó"
                                type="password" {...register('password', passwordRules)}/>
                         {(touchedFields.password || formError.status) && errors.password &&
                             <small style={{color: 'red', whiteSpace: 'pre-line'}}
                                    className="invalid-feedback d-block text-center">{errors.password.message}</small>}
                     </div>
                     <button className="btn btn-success btn-lg w-75 d-block mx-auto m-3" type="submit"
                             disabled={!enable()} onClick={() => {console.log(getValues())}}>
                         Bejelentkezés
                     </button>
                 </div>
             </form>
             <a style={{color: 'blue', whiteSpace: 'pre-line', textDecoration: 'none', cursor: 'pointer'}}
                className="text-primary d-block text-center mx-auto m-2"
                onClick={() => navigate('/main/profile/signup')}>
                 Felhasználó létrehozása
             </a>
             {(error !== null) && (errorMessage.length > 2) &&
                 ((errorState === 500) ?

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

export default Login