import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import PageLoader from './components/PageLoader';
import DashboardLayout from './layouts/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


const HomePage = lazy(() => import('./pages/HomePage'));
const YogaPage = lazy(() => import('./pages/YogaPage'));
const TherapiesPage = lazy(() => import('./pages/TherapiesPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const YogaGalleryPage = lazy(() => import('./pages/YogaGalleryPage'));
const TherapiesGalleryPage = lazy(() => import('./pages/TherapiesGalleryPage'));
const AllMassagesPage = lazy(() => import('./pages/AllMassagesPage'));
const AllTherapiesPage = lazy(() => import('./pages/AllTherapiesPage'));
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage'));
const OurSpacePage = lazy(() => import('./pages/OurSpacePage'));

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
const AgentControl = lazy(() => import('./pages/dashboard/AgentControl'));
const ActivityManager = lazy(() => import('./pages/dashboard/ActivityManager'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LegalNoticePage = lazy(() => import('./pages/LegalNoticePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const MeditationsPage = lazy(() => import('./pages/MeditationsPage'));
const ChatBot = lazy(() => import('./components/ChatBot'));

const AppContent = () => {
    const location = useLocation();

    // Hide ChatBot on login, register, and all dashboard paths
    const hideChatBot =
        location.pathname.startsWith('/login') ||
        location.pathname.startsWith('/dashboard') ||
        location.pathname.startsWith('/register') ||
        location.pathname.startsWith('/forgot-password') ||
        location.pathname.startsWith('/reset-password');

    return (
        <Suspense fallback={<PageLoader />}>
            {!hideChatBot && <ChatBot />}
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/clases-de-yoga" element={<YogaPage />} />
                <Route path="/terapias-y-masajes" element={<TherapiesPage />} />
                <Route path="/terapias/masajes" element={<AllMassagesPage />} />
                <Route path="/terapias/terapias-holisticas" element={<AllTherapiesPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/yoga" element={<BlogPage />} />
                <Route path="/blog/therapy" element={<BlogPage />} />
                <Route path="/blog/general" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/galeria/clases-de-yoga" element={<YogaGalleryPage />} />
                <Route path="/galeria/terapias-y-masajes" element={<TherapiesGalleryPage />} />
                <Route path="/actividades" element={<ActivitiesPage />} />
                <Route path="/nuestro-espacio" element={<OurSpacePage />} />
                <Route path="/quienes-somos" element={<AboutPage />} />
                <Route path="/contacto" element={<ContactPage />} />
                <Route path="/aviso-legal" element={<LegalNoticePage />} />
                <Route path="/politica-de-privacidad" element={<PrivacyPolicyPage />} />
                <Route path="/meditaciones" element={<MeditationsPage />} />

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
                        <Route path="agent" element={<AgentControl />} />
                        <Route path="activities" element={<ActivityManager />} />
                    </Route>
                </Route>
            </Routes>
        </Suspense>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                <AppContent />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
