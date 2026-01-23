import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PageLoader from './components/PageLoader';

const HomePage = lazy(() => import('./pages/HomePage'));
const YogaPage = lazy(() => import('./pages/YogaPage'));
const TherapiesPage = lazy(() => import('./pages/TherapiesPage'));

function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/yoga" element={<YogaPage />} />
                    <Route path="/therapies" element={<TherapiesPage />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
