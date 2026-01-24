import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PageLoader from './components/PageLoader';
import DashboardLayout from './layouts/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const YogaPage = lazy(() => import('./pages/YogaPage'));
const TherapiesPage = lazy(() => import('./pages/TherapiesPage'));

// Dashboard Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const ContentManager = lazy(() => import('./pages/dashboard/ContentManager'));
const ScheduleManager = lazy(() => import('./pages/dashboard/ScheduleManager'));
const SeoStats = lazy(() => import('./pages/dashboard/SeoStats'));

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/yoga" element={<YogaPage />} />
                        <Route path="/therapies" element={<TherapiesPage />} />

                        {/* Auth Route */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Protected Dashboard Routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<DashboardLayout />}>
                                <Route index element={<DashboardHome />} />
                                <Route path="content" element={<ContentManager />} />
                                <Route path="schedule" element={<ScheduleManager />} />
                                <Route path="seo" element={<SeoStats />} />
                            </Route>
                        </Route>
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
