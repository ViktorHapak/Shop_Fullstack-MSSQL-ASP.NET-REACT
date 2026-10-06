import {useForm} from "react-hook-form";
import {useCallback, useEffect, useState} from "react";
import {useStateContext} from "../../../_context/context_provider";
import {useHttp} from "../../../_client/axios";
import styles from './ProductForm.module.css';

function ProductForm(props) {

    let {
        register,
        getValues,
        handleSubmit,
        formState: { errors, touchedFields}
    } = useForm({ mode: 'onTouched', reValidateMode: 'onChange',
        defaultValues: {
            name: '',
            price: '',
            stock: 1,
            departmentId: ''
        }});

    const [formError, setFormError] = useState({
        message: null,
        status: false,
    });

    const nameRules = {
        required: 'Kötelező mező!',
        minLength: { value: 5, message: 'Min. 5 karakter' },
        maxLength: { value: 150, message: 'Max. 150 karakter' },
    };

    const priceRules = {
        required: 'Kötelező mező!',
        min: {value: 10, message: 'Az ár minimum 10 Ft!'},
        max: {value: 999999999, message: 'Az ár túl nagy!'},
        valueAsNumber: true
    };

    const stockRules = {
        required: 'Kötelező mező!',
        min: {value: 0, message: 'A készlet nem lehet negatív!'},
        max: {value: 10000, message: 'A kezdeti készlet túl nagy!'},
        valueAsNumber: true
    };

    const departmentIdRules = {
        required: 'Kategória kiválasztása kötelező!'
    };

    const enable = () => {
        const nameOk = !errors.name && touchedFields.name;
        const priceOk = !errors.price && touchedFields.price;
        const stockOk = !errors.stock;
        const departmentOk = !errors.departmentId && touchedFields.departmentId;
        return (nameOk && priceOk && stockOk && departmentOk);

        /* return (
            productToCreate.name.trim().length >= 5 &&
            Number(productToCreate.price) >= 10 &&
            Number(productToCreate.stock) >= 0 &&
            productToCreate.departmentId != null
          );
       */
    };

    const {notification, token, role, error, errorState, errorMessage, categories,
        setNotification, setLoading, setError, setErrorState, setErrorMessage} = useStateContext();

    const createProduct = useCallback(async data => {
        setNotification(`Új termék létrehozva: \n${data?.name || ""}`)
        props.closeForm();
        props.getProducts();
    }, []);


    const {sendRequest: createProductRequest} = useHttp(`products`, null, 'POST', getValues(), createProduct);

    useEffect(() => {
        return () => {
            setError(null);
            setLoading(false);
            setErrorMessage('');
            setErrorState(null);
        };
    }, [setError, setLoading, setErrorMessage, setErrorState]);

    return (
        <div className={styles["productform-container"]}>
            <div className={styles["title-div"]}>
                <></>
                <h2 className={styles["title"]}>Új termék</h2>
                <button className={`${styles["close-item"]}`} onClick={() => props.closeForm()}>
                    <i className="fa fa-close"></i>
                </button>
            </div>
            <hr/>
            <form onSubmit={handleSubmit(createProductRequest)}>
                <div className={styles["controllers-div"]}>
                    <div className={styles["name-container"]}>
                        <label htmlFor="username-control">Elnevezés:</label>
                        <input className={styles["form-control"]} id="name-control" placeholder=" "
                               type="text" {...register('name', nameRules)}/>
                        {(touchedFields.name || formError.status) && errors.name &&
                            <small style={{color: 'red', whiteSpace: 'pre-line'}}
                                   className="invalid-feedback d-block text-center">{errors.name.message}</small>}
                    </div>
                    <div className={styles["price-container"]}>
                        <label htmlFor="price-control">Ár:</label>
                        <input className={styles["form-control"]} id="price-control" placeholder=""
                               type="number" step="0.01" {...register('price', priceRules)}/>
                        {(touchedFields.price || formError.status) && errors.price &&
                            <small style={{color: 'red', whiteSpace: 'pre-line'}}
                                   className="invalid-feedback d-block text-center">{errors.price.message}</small>}
                    </div>
                    <div className={styles["stock-container"]}>
                        <label htmlFor="stock-control">Kezdeti készlet:</label>
                        <input className={styles["form-control"]} id="stock-control" placeholder=""
                               type="number" {...register('stock', stockRules)}/>
                        {(touchedFields.price || formError.status) && errors.stock &&
                            <small style={{color: 'red', whiteSpace: 'pre-line'}}
                                   className="invalid-feedback d-block text-center">{errors.stock.message}</small>}
                    </div>
                    <div className={styles["department-container"]}>
                        <label htmlFor="department-control">Kategória</label>
                        <select
                            className={`${styles["department-select"]}`}
                            id={`${styles["department-control"]}`}
                            defaultValue={null} {...register('departmentId', departmentIdRules)}
                        >
                            <option value={null} defaultValue></option>
                            {categories.map((category) => (
                                <option
                                    className={`${styles["department-option"]}`}
                                    value={category.id}>
                                    {category?.name ?? ""}
                                </option>
                            ))}

                        </select>
                        {(touchedFields.departmentId || formError.status) && errors.departmentId &&
                            <small style={{color: 'red', whiteSpace: 'pre-line'}}
                                   className="invalid-feedback d-block text-center">{errors.departmentId.message}</small>}
                    </div>
                    <button className="btn btn-success btn-lg w-75 d-block mx-auto m-2 mb-2" type="submit"
                            disabled={!enable()} onClick={console.log(getValues())}>
                        Létrehozás
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

export default ProductForm;