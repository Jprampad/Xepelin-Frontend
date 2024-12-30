// src/index.js o src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // Asegúrate de importar desde 'react-dom/client'
import App from './App';
import './styles/index.css'; // Asegúrate de que la ruta sea correcta

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);