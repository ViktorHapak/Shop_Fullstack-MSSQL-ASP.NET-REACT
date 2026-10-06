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

function Register() {

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
        setError, setErrorMessage, setNotification, setLoading, setErrorState} = useStateContext();
    const navigate = useNavigate();

    const nameRules = {
        required: 'Kötelező mező!',
        minLength: { value: 5, message: 'Min. 5 karakter' },
        maxLength: { value: 30, message: 'Max. 55 karakter' },
        pattern: {
            // allows latin letters incl. accents, numbers, space, underscore, hyphen
            value: /^[A-Za-z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+$/,
            message: 'Nem megengedett karakter !',
        },
    };

    // EMAIL: required + looks like an email
    const emailRules = {
        required: 'Kötelező mező!',
        pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Érvénytelen email cím',
        },
    };

    // BIRTH: required + valid date + after 1910-01-01
    const birthRules = {
        required: 'Kötelező mező!',
        validate: {
            isDate: (v) => !isNaN(Date.parse(v)) || 'Érvénytelen formátum',
            afterMin: (v) =>
                new Date(v) > new Date('1910-01-01') ||
                '1910-01-01 előtti dátum nem kezelt!',
            isEnoughOld: (v) =>
                new Date(v) <= twelveAgo() || 'Legalább 12 évesnek kell lennie',
        },
    };

    // PASSWORD: required + min 8 + 1 lower + 1 upper + 1 digit + 1 special from .!?,;:@
    const passwordRules = {
        required: 'Kötelező mező!',
        minLength: { value: 6, message: 'Min. 6 karakter!'},
        pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
            message:
                'Legalább 1 kis- és nagybetű, 1 szám megadása kötelező!',
        },
    };

    //Adult age-check
    function twelveAgo() {
        const today = new Date();

        return new Date(
            today.getFullYear() - 12,
            today.getMonth(),
            today.getDate()
        );
    }

    function enable(){
        const nameOk = !errors.username && touchedFields.username;
        const emailOk = !errors.email && touchedFields.email;
        const birthOk = !errors.birth && touchedFields.birth;
        const passwordOk = !errors.password && touchedFields.password;

        return (nameOk && emailOk && birthOk && passwordOk);
    }

    const handleRegister = useCallback((data) => {
        setNotification(`Új felhasználó létrehozva: \n ${data.username}`);
        navigate('/');
    }, [navigate, setNotification]);

    const {sendRequest} = useHttp(`auth/register`, null, "POST", getValues(), handleRegister);

    useEffect(() => {
        return () => {
            setError(null);
            setLoading(false);
            setErrorMessage('');
            setErrorState(null);
        };
    }, [setError, setLoading, setErrorMessage, setErrorState]);

    return (
        <div className={styles["register-container"]}>
            <div className={styles["title-div"]}>
                <h2 className={styles["title"]}>Felhasználó létrehozása</h2>
            </div>
            <div className={styles["img-div"]}>
                <img className={styles["empty-img"]} src={emptyImageUrl}></img>
            </div>
            <hr/>
            <form onSubmit={handleSubmit(sendRequest)}>
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
                    <div className={styles["birth-container"]}>
                        <label htmlFor="birth-control">Szül. dátum:</label>
                        <input className={styles["form-control"]} id="email-control" placeholder="Szül. dátum"
                               type="date" {...register('birth', birthRules)}/>
                        {touchedFields.birth && errors.birth &&
                            <small style={{color: 'red', whiteSpace: 'pre-line'}}
                                   className="invalid-feedback d-block text-center">{errors.birth.message}</small>}
                    </div>
                    <div className={styles["password-container"]}>
                        <label htmlFor="password-control">Jelszó:</label>
                        <input className={styles["form-control"]} id="password-control" placeholder="Jelszó"
                               type="password" {...register('password', passwordRules)}/>
                        {(touchedFields.password || formError.status) && errors.password &&
                            <small style={{color: 'red', whiteSpace: 'pre-line'}}
                                   className="invalid-feedback d-block text-center">{errors.password.message}</small>}
                    </div>
                    <button className="btn btn-success btn-lg w-75 d-block mx-auto m-4 mb-4" type="submit"
                            disabled={!enable()}>
                        Regisztráció
                    </button>
                </div>
            </form>
            {(error !== null) && (errorMessage.length > 2) &&
                ((errorState === 500) ?

                        (
                            <div className="alert alert-warning d-block mx-5 mt-3">
                                Szerver hiba!
                            </div>
                        ) : (
                            <div className="alert alert-danger d-block mx-5 mt-3">
                                {errorMessage}
                            </div>
                        )
                )
            }
        </div>
    )
}

export default Register;