import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-svg-core';
import '@fortawesome/react-fontawesome';
import styles from './Main.module.css';
import user_img from '../assets/user.webp'
import {Link, Outlet, useLocation, useNavigate} from "react-router";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {useStateContext} from "../_context/context_provider";
import {useHttp} from "../_client/axios";

function App() {

  const {errorState, notification, user, parameters,
      token, role, demoMode,  authorities,
      setParameters, setNotification, removeToken, setAuthorities,
        setProducts, setCategories, demoProducts, demoCategories} = useStateContext();
  const [searchTitle, setSearchTitle] = useState(parameters.title);
  const [serverError, setServerError] = useState(false);

  const [showSubmenu, setShowSubmenu] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);

  const getAuthorities = useCallback(async (data) => {
        console.log("Authorities: ",data);
        setAuthorities(data);
  }, [])

  const {sendRequest: getAuthoritiesRequest} = useHttp("auth/authorities", null, 'GET', null, getAuthorities);

  useEffect(() => {
      if (role === "Admin") getAuthoritiesRequest();
      console.log(authorities);
  }, [role])

  useEffect(() => {
      const timer = setTimeout(setParameters({
          ...parameters,
          page: 0,
          title: searchTitle,
      }), 200);


      return () => clearTimeout(timer);
  }, [searchTitle]);

  useEffect(() => {
     if (location.pathname !== '/' && location.pathname !== '/main/shopping-area'){
         searchInputRef.current?.focus();
     }
  }, [location.pathname]);

  const displaySubMenu = () => {
    return (
        token &&
        ["moderator", "admin"].includes(role?.toLowerCase()) &&
        !location.pathname.startsWith("/main/profile") &&
        !location.pathname.startsWith("/main/admin_panel")
    );
  };

  const search = async (searchTitle) => {
      if (location.pathname !== '/' && location.pathname !== '/main/shopping-area') {
          navigate('/');
      }
      setSearchTitle(searchTitle);
  }

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
      if (demoMode) {
          setProducts(demoProducts);
          setCategories(demoCategories);
      }
  }, [])

    return (
        <div className={styles["app-container"]}>
            {notification && (
                <div className={styles["notification-container"]}>
                    <span className={styles["notification-text"]}>
                        {notification}
                    </span>

                    <div className={styles["ok-row"]}>
                        <button
                            type="button"
                            className={`${styles["ok-button"]} btn btn-primary`}
                            onClick={() => setNotification(null)}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {!token && (
                <div className={styles["demo-message-div"]}>
                    <p>Üdvözöllek a weboldalam demo módjában! A megtekintéshez használjon anonim bejelentkezést!</p>
                    <ul>
                        <li>Felhasználónév: <i>anonymus</i></li>
                        <li>Jelszó: <i>Anonim123...</i></li>
                    </ul>
                </div>
            )}

            <nav className={styles["nav-container"]}>
                <ul className={styles["nav-items"]}>
                    <div className={styles["left-nav"]}>
                        <li className={`${styles["nav-item"]} ${styles["brand-item"]}`}>
                            <Link className={styles["navbar-brand"]} to="/">MyShop</Link>
                        </li>
                        <li className={`${styles["nav-item"]} ${styles["search-item"]}`}>
                            <div className={styles["search-box"]}>
                                <input
                                    ref={searchInputRef}
                                    className={styles["input-search"]}
                                    type="search"
                                    placeholder="Termék neve"
                                    value={searchTitle}
                                    onChange={(event) => search(event.target.value)}
                                />

                                <a className={styles["search-icon"]}><i className="fa fa-search" /></a>
                            </div>
                        </li>
                    </div>

                    <div className={styles["right-nav"]}>
                        {token && ( role === "Visitor" || role === "anonymous" ) &&
                            (
                                <li className={`${styles["nav-item"]} ${styles["desktop-nav-item"]}`}>
                                    <Link className={styles["nav-link"]} to="/main/orders">
                                        <i className="fa fa-list" />
                                        <span>Rendelések</span>
                                    </Link>
                                </li>
                            )
                        }

                        {token && ( role === "Visitor" || role === "anonymous" ) &&
                            (
                                <li className={`${styles["nav-item"]} ${styles["desktop-nav-item"]}`}>
                                    <Link className={styles["nav-link"]} to="/main/cart_content">
                                        <i className="fa fa-shopping-basket" />
                                        <span>Kosár</span>
                                    </Link>
                                </li>
                            )
                        }

                        {token && role === "Admin" &&
                            (
                                <li className={`${styles["nav-item"]} ${styles["desktop-nav-item"]}`}>
                                    <Link className={styles["nav-link"]} to="/main/admin_panel">
                                        <i className="fa fa-gear" />
                                        <span>Beállítások</span>
                                    </Link>
                                </li>
                            )
                        }

                        <li className={`${styles["nav-item"]} dropdown`}>
                            <button className={`${styles["profile-button"]} dropdown-toggle`} type="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                <img className={styles["profile-image"]} src={user_img} alt="Felhasználói fiók"/>
                            </button>

                            <ul className={`dropdown-menu dropdown-menu-end ${styles["profile-dropdown"] ?? ""}`}>
                                {!token && (
                                    <li>
                                        <Link className="dropdown-item" to="/main/profile/login">
                                            Bejelentkezés
                                        </Link>
                                    </li>
                                )}

                                {token &&
                                    (<li>
                                        <Link className="dropdown-item" type="button" onClick={() => {removeToken()}}>
                                            Kijelentkezés
                                        </Link>
                                    </li>)
                                }

                                <li>
                                    <Link className="dropdown-item" to="/main/profile/signup">
                                        Új felhasználó
                                    </Link>
                                </li>

                                {token && (
                                    <>
                                        <hr className={styles["dropdown-hr"]}/>
                                        <li>
                                            <Link className="dropdown-item" to="/main/profile/info">
                                                Profil
                                            </Link>
                                        </li>
                                    </>
                                )}

                                {token && ( role === "Visitor" || role === "anonymous" ) && (
                                    <li className={styles["optional-li"]}>
                                        <Link className="dropdown-item" to="/main/orders">
                                            <i className="fa fa-list" />
                                            <span> Rendelések</span>
                                        </Link>
                                    </li>
                                )}

                                {token && ( role === "Visitor" || role === "anonymous" ) && (
                                    <li className={styles["optional-li"]}>
                                        <Link className="dropdown-item" to="/main/cart_content">
                                            <i className="fa fa-shopping-basket" />
                                            <span> Kosár</span>
                                        </Link>
                                    </li>
                                )}

                                {token && role === "Admin" && (
                                    <li className={styles["optional-li"]}>
                                        <Link className="dropdown-item" to="/main/admin_panel">
                                            <i className="fa fa-gear" />
                                            <span> Beállítások</span>
                                        </Link>
                                    </li>
                                )}

                            </ul>
                        </li>
                    </div>
                </ul>
            </nav>

            <div className={styles["main-container"]}>
                {displaySubMenu() &&
                    (
                        <div className={`${styles["submenu-container"]} ${showSubmenu ? styles["open"] : ""}`}>
                            <aside className={`${styles["submenu"]}`}>
                                <a className={`${styles["close-item"]}`}
                                   onClick={() => setShowSubmenu(false)}>
                                    <i className="fa fa-close" />
                                </a>
                                <ul className={`${styles["submenu-items"]} `}>
                                    <li className={`${styles["submenu-item"]} `}>
                                        <Link className={`${styles["submenu-link"]} ${isActive("/main/carts_area") ? styles["active"] : ""}`}
                                              activeClassName="active" to="/main/carts_area">
                                            <i className="fa fa-shopping-basket" />
                                            <span>Bevásárlási listák</span>
                                        </Link>
                                    </li>
                                    <li className={`${styles["submenu-item"]}`}>
                                        <Link className={`${styles["submenu-link"]} ${isActive("/main/orders_area") ? styles["active"] : ""}`}
                                              activeClassName="active" to="/main/orders_area">
                                            <i className="fa fa-list"/>
                                            <span>Rendelések</span>
                                        </Link>
                                    </li>
                                    <li className={`${styles["submenu-item"]}`}>
                                        <Link className={`${styles["submenu-link"]} ${isActive("/main/users") ? styles["active"] : ""}`}
                                              activeClassName="active" to="/main/users">
                                            <i className="fa fa-users" />
                                            <span>Felhasználók</span>
                                        </Link>
                                    </li>
                                    <li className={`${styles["submenu-item"]}`}>
                                        <Link className={`${styles["submenu-link"]} ${isActive("/main/others_area") ? styles["active"] : ""}`}
                                              activeClassName="active" to="/main/others_area">
                                            <i className="fa fa fa-th-large" />
                                            <span>Egyéb</span>
                                        </Link>
                                    </li>
                                </ul>
                            </aside>
                            <button
                                className={styles["sliding-button"]}
                                onClick={() => setShowSubmenu(prev => !prev)}
                            >
                                {showSubmenu
                                    ? <i className="fa fa-angle-left" />
                                    : <i className="fa fa-angle-right" />
                                }
                            </button>
                        </div>
                    )

                }
                <Outlet />
            </div>
        </div>
    );
}

export default App;
