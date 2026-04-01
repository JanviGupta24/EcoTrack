// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Global TailwindCSS styles and animations
import App from './App';

/**
 * @file index.js
 * This is the main entry point for the React application.
 * It initializes the root of the React DOM and renders the main <App /> component.
 */

// 1. Get the root DOM element where the React app will be mounted.
const rootElement = document.getElementById('root');

// 2. Create a React root for concurrent rendering.
const root = ReactDOM.createRoot(rootElement);

// 3. Render the main App component.
// <React.StrictMode> is used to activate additional checks and warnings
// for potential problems in the app during development.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);