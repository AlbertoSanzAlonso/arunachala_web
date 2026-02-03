import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App';

import { HelmetProvider } from 'react-helmet-async';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <HelmetProvider>
        <App />
    </HelmetProvider>
);
