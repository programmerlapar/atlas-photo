import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { useThemeStore } from './stores/themeStore';
import './styles/globals.css';
import './styles/leaflet.css';

// Initialize theme on app load
const { theme } = useThemeStore.getState();
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', theme);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </HashRouter>
  </React.StrictMode>
);
