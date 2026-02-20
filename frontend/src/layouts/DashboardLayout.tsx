import React, { Fragment, useState, useEffect } from 'react';
import logoIcon from '../assets/images/logo_icon.webp';
import logoWide from '../assets/images/logo_wide.webp';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Dialog, Transition, Menu } from '@headlessui/react';
import { useAuth } from '../context/AuthContext';
import {
    HomeIcon,
    DocumentTextIcon,
    CalendarIcon,
    ChartBarIcon,
    Bars3Icon,
    XMarkIcon,
    PhotoIcon,
    UserCircleIcon,
    UsersIcon,
    HeartIcon,
    ArrowRightOnRectangleIcon,
    ChatBubbleLeftRightIcon,
    GlobeAltIcon,
    SparklesIcon,
    PaintBrushIcon,
    TicketIcon
} from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Vista General', href: '/dashboard', icon: HomeIcon },
    { name: 'Personalizar', href: '/dashboard/customize', icon: PaintBrushIcon },
    { name: 'Galería', href: '/dashboard/gallery', icon: PhotoIcon },
    { name: 'Contenido', href: '/dashboard/content', icon: DocumentTextIcon },
    { name: 'Tratamientos', href: '/dashboard/treatments', icon: HeartIcon },
    { name: 'Horarios', href: '/dashboard/schedule', icon: CalendarIcon },
    { name: 'Actividades', href: '/dashboard/activities', icon: SparklesIcon },
    { name: 'Usuarios', href: '/dashboard/users', icon: UsersIcon },
    { name: 'Control de Agente', href: '/dashboard/agent', icon: ChatBubbleLeftRightIcon },
    { name: 'Promociones', href: '/dashboard/promotions', icon: TicketIcon },
    { name: 'SEO & Google', href: '/dashboard/seo', icon: ChartBarIcon },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const location = useLocation();
    const { logout, showSessionWarning, extendSession, remainingTime } = useAuth();

    // Format remaining time (MM:SS)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        fetchUserProfile();

        // Listen for profile updates
        const handleProfileUpdate = () => {
            fetchUserProfile();
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);

        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUserProfile(data);
            }
        } catch (error) {
            console.error("Error loading user profile", error);
        }
    };

    const getUserInitial = () => {
        if (userProfile?.first_name) {
            return userProfile.first_name.charAt(0).toUpperCase();
        }
        if (userProfile?.email) {
            return userProfile.email.charAt(0).toUpperCase();
        }
        return 'A';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="dashboard-scale contents lg:block">
                <Transition.Root show={sidebarOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-500"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-in-out duration-500"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-gray-900/80" />
                        </Transition.Child>

                        <div className="fixed inset-0 flex">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-out duration-500 transform"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition ease-in-out duration-500 transform"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-out duration-500"
                                        enterFrom="opacity-0"
                                        enterTo="opacity-100"
                                        leave="ease-in duration-400"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                            <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                                                <span className="sr-only">Close sidebar</span>
                                                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </Transition.Child>
                                    {/* Sidebar component for mobile */}
                                    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                                        <div className="flex flex-col shrink-0 items-center mt-6 mb-1">
                                            <img src={logoIcon} alt="Arunachala Icon" className="h-16 w-auto mb-1 rounded-full" />
                                            <h1 className="text-xl font-bold text-primary-600 tracking-tight font-headers">Arunachala<span className="text-gray-400 font-light text-base">Panel</span></h1>
                                        </div>
                                        <nav className="flex flex-1 flex-col">
                                            <ul className="flex flex-1 flex-col gap-y-7">
                                                <li>
                                                    <ul className="-mx-2 space-y-1">
                                                        {navigation.map((item) => (
                                                            <li key={item.name}>
                                                                <Link
                                                                    to={item.href}
                                                                    onClick={() => setSidebarOpen(false)}
                                                                    className={classNames(
                                                                        location.pathname === item.href
                                                                            ? 'bg-primary-50 text-primary-600'
                                                                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                                                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200'
                                                                    )}
                                                                >
                                                                    <item.icon
                                                                        className={classNames(
                                                                            location.pathname === item.href ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600',
                                                                            'h-6 w-6 shrink-0 transition-colors duration-200'
                                                                        )}
                                                                        aria-hidden="true"
                                                                    />
                                                                    {item.name}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition.Root>

                {/* Static sidebar for desktop */}
                <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
                        <div className="flex flex-col shrink-0 items-center mt-6 mb-1">
                            <img src={logoIcon} alt="Arunachala Icon" className="h-24 w-auto mb-1 rounded-full" />
                            <h1 className="text-xl font-bold text-primary-600 tracking-tight font-headers">Arunachala<span className="text-gray-400 font-light">Panel</span></h1>
                        </div>
                        <nav className="flex flex-1 flex-col">
                            <ul className="flex flex-1 flex-col gap-y-7">
                                <li>
                                    <ul className="-mx-2 space-y-1">
                                        {navigation.map((item) => (
                                            <li key={item.name}>
                                                <Link
                                                    to={item.href}
                                                    className={classNames(
                                                        location.pathname === item.href
                                                            ? 'bg-primary-50 text-primary-600'
                                                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200'
                                                    )}
                                                >
                                                    <item.icon
                                                        className={classNames(
                                                            location.pathname === item.href ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600',
                                                            'h-6 w-6 shrink-0 transition-colors duration-200'
                                                        )}
                                                        aria-hidden="true"
                                                    />
                                                    {item.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="lg:pl-72 flex flex-col flex-1">
                    {/* Header: Improved responsive behavior */}
                    <div className="sticky top-0 z-40 flex h-16 lg:h-24 shrink-0 items-center border-b border-gray-200 bg-[#becf81] shadow-sm">
                        <div className="flex items-center w-full px-4 sm:px-6 lg:px-8">
                            <button
                                type="button"
                                className="p-2 text-gray-700 lg:hidden bg-white/50 rounded-full mr-2"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <span className="sr-only">Open sidebar</span>
                                <Bars3Icon className="h-5 w-5" aria-hidden="true" />
                            </button>

                            {/* Logo: Centered on mobile, left on desktop */}
                            <div className="flex-1 flex justify-center lg:justify-start overflow-hidden h-full py-2">
                                <img
                                    src={logoWide}
                                    alt="Arunachala"
                                    className="h-full w-auto object-contain max-h-12 lg:max-h-20"
                                />
                            </div>

                            {/* User Menu & Links */}
                            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                                <a
                                    href="/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-primary-900 text-xs font-semibold transition-colors border border-white/10 shadow-sm"
                                    title="Ir a la Web"
                                >
                                    <GlobeAltIcon className="w-4 h-4" />
                                    <span className="hidden md:inline">Ir a la Web</span>
                                </a>
                                <Menu as="div" className="relative">
                                    <Menu.Button className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors p-1 pr-2 md:px-3 md:py-1.5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#becf81]">
                                        <span className="sr-only">Open user menu</span>
                                        {userProfile?.profile_picture ? (
                                            <img
                                                className="h-7 w-7 md:h-8 md:w-8 rounded-full object-cover border border-white shadow-sm"
                                                src={`${API_URL}${userProfile.profile_picture}`}
                                                alt="Profile"
                                            />
                                        ) : (
                                            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-white flex items-center justify-center text-[#becf81] font-bold border border-white shadow-sm font-headers text-sm">
                                                {getUserInitial()}
                                            </div>
                                        )}
                                        <span className="hidden sm:block text-xs font-medium text-gray-800">
                                            {userProfile?.first_name || 'Admin'}
                                        </span>
                                    </Menu.Button>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-200"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-150"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Sesión como</p>
                                                <p className="text-xs font-medium text-gray-900 truncate">
                                                    {userProfile?.email || 'Admin'}
                                                </p>
                                            </div>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        to="/dashboard/profile"
                                                        className={classNames(
                                                            active ? 'bg-gray-50' : '',
                                                            'block px-4 py-2 text-sm text-gray-700 flex items-center gap-2'
                                                        )}
                                                    >
                                                        <UserCircleIcon className="h-4 w-4 text-gray-400" />
                                                        Mi Cuenta
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => {
                                                            logout();
                                                            window.location.href = '/login';
                                                        }}
                                                        className={classNames(
                                                            active ? 'bg-gray-50' : '',
                                                            'block w-full text-left px-4 py-2 text-sm text-red-600 flex items-center gap-2'
                                                        )}
                                                    >
                                                        <ArrowRightOnRectangleIcon className="h-4 w-4 text-red-400" />
                                                        Cerrar Sesión
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                        </div>
                    </div>

                    <main className="py-6 lg:py-10 flex-1">
                        <div className="px-4 sm:px-6 lg:px-8">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>

            {/* Session Timeout Warning Modal */}
            <Transition.Root show={showSessionWarning} as={Fragment}>
                <Dialog as="div" className="relative z-50 font-body" onClose={() => { }}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <ArrowRightOnRectangleIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                            <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900 font-headers">
                                                Tu sesión está a punto de expirar
                                            </Dialog.Title>
                                            <div className="mt-2 flex flex-col items-center">
                                                <p className="text-sm text-gray-500 mb-4 text-center">
                                                    Hemos detectado inactividad. Tu sesión se cerrará en:
                                                </p>

                                                <div className="relative h-24 w-24 flex items-center justify-center mb-4">
                                                    <svg className="transform -rotate-90 w-full h-full">
                                                        <circle
                                                            cx="48"
                                                            cy="48"
                                                            r="40"
                                                            stroke="currentColor"
                                                            strokeWidth="8"
                                                            fill="transparent"
                                                            className="text-gray-200"
                                                        />
                                                        <circle
                                                            cx="48"
                                                            cy="48"
                                                            r="40"
                                                            stroke="currentColor"
                                                            strokeWidth="8"
                                                            fill="transparent"
                                                            strokeDasharray={251.2}
                                                            strokeDashoffset={251.2 * (1 - remainingTime / 120)}
                                                            className="text-primary-600 transition-all duration-1000 ease-linear"
                                                        />
                                                    </svg>
                                                    <span className="absolute text-xl font-mono font-bold text-gray-700">
                                                        {formatTime(remainingTime)}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-gray-400 text-center">
                                                    ¿Quieres seguir conectado?
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 sm:ml-3 sm:w-auto"
                                            onClick={extendSession}
                                        >
                                            Mantener Sesión
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() => logout()}
                                        >
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
}
