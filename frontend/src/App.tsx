import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PageLoader from './components/PageLoader';
import DashboardLayout from './layouts/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


const HomePage = lazy(() => import('./pages/HomePage'));
const YogaPage = lazy(() => import('./pages/YogaPage'));
const TherapiesPage = lazy(() => import('./pages/TherapiesPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const YogaGalleryPage = lazy(() => import('./pages/YogaGalleryPage'));
const TherapiesGalleryPage = lazy(() => import('./pages/TherapiesGalleryPage'));

// Dashboard Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const GalleryManager = lazy(() => import('./pages/dashboard/GalleryManager'));
const ContentManager = lazy(() => import('./pages/dashboard/ContentManager'));
const ScheduleManager = lazy(() => import('./pages/dashboard/ScheduleManager'));
const SeoStats = lazy(() => import('./pages/dashboard/SeoStats'));
const UserProfile = lazy(() => import('./pages/dashboard/profile/UserProfile'));
const CreateUser = lazy(() => import('./pages/dashboard/CreateUser'));
const ClassTypeManager = lazy(() => import('./pages/dashboard/ClassTypeManager'));
const TreatmentsManager = lazy(() => import('./pages/dashboard/TreatmentsManager'));
const UserManager = lazy(() => import('./pages/dashboard/UserManager'));

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/yoga" element={<YogaPage />} />
                        <Route path="/masajes-y-terapias" element={<TherapiesPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/galeria/yoga" element={<YogaGalleryPage />} />
                        <Route path="/galeria/masajes-y-terapias" element={<TherapiesGalleryPage />} />

                        {/* Auth Route */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />

                        {/* Protected Dashboard Routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<DashboardLayout />}>
                                <Route index element={<DashboardHome />} />
                                <Route path="gallery" element={<GalleryManager />} />
                                <Route path="content" element={<ContentManager />} />
                                <Route path="schedule" element={<ScheduleManager />} />
                                <Route path="seo" element={<SeoStats />} />
                                <Route path="profile" element={<UserProfile />} />
                                <Route path="create-user" element={<CreateUser />} />
                                <Route path="classes" element={<ClassTypeManager />} />
                                <Route path="treatments" element={<TreatmentsManager />} />
                                <Route path="users" element={<UserManager />} />
                            </Route>
                        </Route>
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
