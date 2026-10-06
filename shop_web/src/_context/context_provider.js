import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {Product} from "../_models/Product";
import {useHttp} from "../_client/axios";
import productImageUrl from "../assets/product.webp";
import {useNavigate} from "react-router";

const StateContext = createContext({
    user: null,
    token: null,
    authorities: null,
    notification: null,
    role: null,
    demoMode: null,
    editMode: null,
    error: null,
    errorMessage: null,
    errorState: null,
    loading: null,
    products: null,
    categories: null,
    minPrice: null,
    maxPrice: null,
    productImgs: null,
    pages: null,
    parameters: null,
    demoCategories: null,
    demoProducts: null,
    demoCart: null,
    demoOrder: null,
    setUser: () => {},
    setToken: () => {},
    setAuthorities: () => {},
    setNotification: () => {},
    setRole: () => {},
    setDemoMode: () => {},
    setEditMode: () => {},
    setError: () => {},
    setErrorMessage: () => {},
    setErrorState: () => {},
    setLoading: () => {},
    setProducts: () => {},
    setCategories: () => {},
    setMinPrice: () => {},
    setMaxPrice: () => {},
    setProductImgs: () => {},
    setPages: () => {},
    setParameters: () => {},
    setDemoCart: () => {},
    setDemoOrder: () => {},
});

const DEMO_CATEGORIES = [
    { id: 1, name: "Category 1" },
    { id: 2, name: "Category 2" },
    { id: 3, name: "Category 3" }
];

const DEMO_PRODUCTS = [
    { id: 1, name: "Product 1", price: 2000, stock: 10, departmentId: 1, dataUrl: productImageUrl },
    { id: 2, name: "Product 2", price: 1500, stock: 7, departmentId: 1, dataUrl: productImageUrl },
    { id: 3, name: "Product 3", price: 850, stock: 15, departmentId: 1, dataUrl: productImageUrl },

    { id: 4, name: "Product 4", price: 4300, stock: 6, departmentId: 2, dataUrl: productImageUrl },
    { id: 5, name: "Product 5", price: 2700, stock: 12, departmentId: 2, dataUrl: productImageUrl },
    { id: 6, name: "Product 6", price: 990, stock: 9, departmentId: 2, dataUrl: productImageUrl },

    { id: 7, name: "Product 7", price: 5600, stock: 3, departmentId: 3, dataUrl: productImageUrl },
    { id: 8, name: "Product 8", price: 1200, stock: 18, departmentId: 3, dataUrl: productImageUrl },
    { id: 9, name: "Product 9", price: 3400, stock: 5, departmentId: 3, dataUrl: productImageUrl },
    { id: 10, name: "Product 10", price: 750, stock: 20, departmentId: 3, dataUrl: productImageUrl }
];

export const ContextProvider  = ({children}) => {
    const [user, setUser] = useState({ name: null });
    const [notification, _setNotification] = useState('')
    const [token, _setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));
    const [authorities, setAuthorities] = useState({});
    const [role, _setRole] = useState(localStorage.getItem('ROLE'));
    const [demoMode, setDemoMode] = useState(localStorage.getItem('DEMO_MODE') ?? false);

    const [editMode, _setEditMode] = useState(false);
    const [error, setError] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorState, setErrorState] = useState(null);

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [minPrice, setMinPrice] = useState(0.0);
    const [maxPrice, setMaxPrice] = useState(0.0);
    const [productImgs, setProductImgs] = useState(null);
    const [pages, setPages] = useState(0);
    const [parameters, _setParameters] =
        useState({page : 0, size : 8, title: "", department_name: null, min_price: null, max_price: null, order: "default"});

    const [demoCart, setDemoCart] = useState({items: [], totalPrice: 0 });
    const [demoOrder, setDemoOrder] = useState({items: [], totalPrice: 0, status: 0});

    const demoProducts = structuredClone(DEMO_PRODUCTS);
    const demoCategories = structuredClone(DEMO_CATEGORIES);


    useEffect(() => {
        if (minPrice == 0 || minPrice == null)
            setParameters({...parameters, min_price: null})
    }, [minPrice]);

    useEffect(() => {
        if (maxPrice == 0 || maxPrice == null)
            setParameters({...parameters, max_price: null})

    }, [maxPrice]);

    const setNotification = (message) => {
        _setNotification(message);
        setTimeout(() => {
            _setNotification('')
        }, 5000)
    }

    const setToken = (token) => {
        console.log("SET TOKEN RECEIVED:", token);
        _setToken(token)
        localStorage.setItem('ACCESS_TOKEN', token)
    }

    const setRole = (_role) => {
        _setRole(_role);
        localStorage.setItem('ROLE', _role);
        if (_role === "anonymous") {
            localStorage.setItem('DEMO_MODE', true);
            setDemoMode(true)
            setCategories(structuredClone(DEMO_CATEGORIES))
            setProducts(structuredClone(DEMO_PRODUCTS));
        }
    }

    const removeToken = () => {
        _setToken(null);
        _setRole(null);
        setError({});

        if(demoMode){
            setProducts([]);
            setCategories([]);
            setMinPrice(null)
            setMaxPrice(null)
        }

        setDemoMode(false);
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('ROLE')
        localStorage.removeItem('DEMO_MODE');

        console.log("Removed token!")
    }

    const setEditMode = () => {
        setEditMode(!editMode);
    }

    const setParameters = (parameters) => {
        _setParameters(parameters);
    }

    return (
        // eslint-disable-next-line react/jsx-no-undef
        <StateContext.Provider value={{
            user, setUser,
            token, setToken, removeToken,
            notification, setNotification,
            role, setRole,
            demoMode, setDemoMode,
            authorities, setAuthorities,
            editMode, setEditMode,
            error, setError,
            errorMessage, setErrorMessage,
            errorState, setErrorState,
            loading, setLoading,
            products, setProducts,
            categories, setCategories,
            minPrice, setMinPrice,
            maxPrice, setMaxPrice,
            productImgs, setProductImgs,
            pages, setPages,
            parameters, setParameters,
            demoProducts, demoCategories,
            demoCart, setDemoCart,
            demoOrder, setDemoOrder,
        }}>
            {children}
        </StateContext.Provider>
    );
}

export const useStateContext = () => useContext(StateContext);