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
    UserPlusIcon,
    TagIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Vista General', href: '/dashboard', icon: HomeIcon },
    { name: 'Galería', href: '/dashboard/gallery', icon: PhotoIcon },
    { name: 'Contenido', href: '/dashboard/content', icon: DocumentTextIcon },
    { name: 'Menú de Clases', href: '/dashboard/classes', icon: TagIcon },
    { name: 'Horarios', href: '/dashboard/schedule', icon: CalendarIcon },
    { name: 'SEO & Google', href: '/dashboard/seo', icon: ChartBarIcon },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const location = useLocation();
    const { logout, showSessionWarning, extendSession } = useAuth();

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
        <>
            <div>
                <Transition.Root show={sidebarOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-gray-900/80" />
                        </Transition.Child>

                        <div className="fixed inset-0 flex">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-in-out duration-300 transform"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition ease-in-out duration-300 transform"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-in-out duration-300"
                                        enterFrom="opacity-0"
                                        enterTo="opacity-100"
                                        leave="ease-in-out duration-300"
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
                                            <img src={logoIcon} alt="Arunachala Icon" className="h-24 w-auto mb-1 rounded-full" />
                                            <h1 className="text-xl font-bold text-primary-600 tracking-tight">Arunachala<span className="text-gray-400 font-light">Panel</span></h1>
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
                                                                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                                                    )}
                                                                >
                                                                    <item.icon
                                                                        className={classNames(
                                                                            location.pathname === item.href ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600',
                                                                            'h-6 w-6 shrink-0'
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
                            <h1 className="text-xl font-bold text-primary-600 tracking-tight">Arunachala<span className="text-gray-400 font-light">Panel</span></h1>
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

                <div className="lg:pl-72">
                    <div className="sticky top-0 z-40 flex h-24 shrink-0 px-0 items-center border-b border-gray-200 bg-[#becf81] shadow-sm justify-between relative">
                        <div className="flex items-center h-full w-full relative">
                            <button
                                type="button"
                                className="-m-2.5 p-2.5 text-gray-700 lg:hidden absolute left-4 z-50 bg-white/50 rounded-full"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <span className="sr-only">Open sidebar</span>
                                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                            </button>

                            {/* Header Logo Banner - Full bleed with no margins, matching bg color */}
                            <div className="w-full h-full flex items-center justify-center lg:justify-start bg-[#becf81] lg:pl-0">
                                <img
                                    src={logoWide}
                                    alt="Arunachala"
                                    className="h-full w-auto max-w-full object-contain"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 absolute right-0 pr-4 sm:pr-6 lg:pr-8 h-full bg-gradient-to-l from-[#becf81] via-[#becf81]/90 to-transparent pl-8">
                            <Menu as="div" className="relative ml-3">
                                <div>
                                    <Menu.Button className="flex items-center gap-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#becf81]">
                                        <span className="sr-only">Open user menu</span>
                                        {userProfile?.profile_picture ? (
                                            <img
                                                className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
                                                src={`${API_URL}${userProfile.profile_picture}`}
                                                alt="Profile"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#becf81] font-bold border-2 border-white shadow-sm">
                                                {getUserInitial()}
                                            </div>
                                        )}
                                        <span className="hidden sm:block text-sm font-medium text-gray-800">
                                            {userProfile?.first_name && userProfile?.last_name
                                                ? `${userProfile.first_name} ${userProfile.last_name}`
                                                : userProfile?.first_name || userProfile?.email?.split('@')[0] || 'Usuario'}
                                        </span>
                                    </Menu.Button>
                                </div>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">

                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm text-gray-500">Sesión iniciada como</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {userProfile?.email || 'Cargando...'}
                                            </p>
                                        </div>

                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to="/dashboard/create-user"
                                                    className={classNames(
                                                        active ? 'bg-gray-100' : '',
                                                        'block px-4 py-2 text-sm text-gray-700 flex items-center gap-2'
                                                    )}
                                                >
                                                    <UserPlusIcon className="h-5 w-5 text-gray-400" />
                                                    Crear Usuario
                                                </Link>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to="/dashboard/profile"
                                                    className={classNames(
                                                        active ? 'bg-gray-100' : '',
                                                        'block px-4 py-2 text-sm text-gray-700 flex items-center gap-2'
                                                    )}
                                                >
                                                    <UserCircleIcon className="h-5 w-5 text-gray-400" />
                                                    Mi Cuenta
                                                </Link>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => {
                                                        // Handle logout logic here
                                                        logout();
                                                        window.location.href = '/login';
                                                    }}
                                                    className={classNames(
                                                        active ? 'bg-gray-100' : '',
                                                        'block w-full text-left px-4 py-2 text-sm text-red-600 flex items-center gap-2'
                                                    )}
                                                >
                                                    <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-400" />
                                                    Cerrar Sesión
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        </div>
                    </div>

                    <main className="py-10">
                        <div className="px-4 sm:px-6 lg:px-8">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>

            {/* Session Timeout Warning Modal */}
            <Transition.Root show={showSessionWarning} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => { }}>
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
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                                Tu sesión está a punto de expirar
                                            </Dialog.Title>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Hemos detectado inactividad durante un tiempo. Por seguridad, tu sesión se cerrará automáticamente en 2 minutos. ¿Quieres seguir conectado?
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
        </>
    );
}
