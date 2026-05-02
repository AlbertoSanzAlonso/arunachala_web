import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { HelmetProvider } from 'react-helmet-async';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <QueryClientProvider client={queryClient}>
        <HelmetProvider>
            <App />
        </HelmetProvider>
    </QueryClientProvider>
);
