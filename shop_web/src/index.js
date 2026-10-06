import React from 'react';
import ReactDOM from 'react-dom/client';
import {Routes} from "./_routes/routes";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-svg-core';
import '@fortawesome/react-fontawesome';
import './index.css';
import {RouterProvider} from "react-router";
import {ContextProvider} from "./_context/context_provider";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <ContextProvider>
          <RouterProvider router={Routes} />
      </ContextProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
