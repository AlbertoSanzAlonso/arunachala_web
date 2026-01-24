import React from 'react';
import { ArrowTrendingUpIcon, UsersIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

const stats = [
    { name: 'Visitas Totales', stat: '12,453', change: '12%', changeType: 'increase', icon: UsersIcon },
    { name: 'Páginas Vistas', stat: '45,231', change: '5.4%', changeType: 'increase', icon: DocumentDuplicateIcon },
    { name: 'Ratio de Rebote', stat: '24.57%', change: '3.2%', changeType: 'decrease', icon: ArrowTrendingUpIcon },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function DashboardHome() {
    return (
        <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-8">
                Vista General
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {stats.map((item) => (
                    <div
                        key={item.name}
                        className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6 border border-gray-100"
                    >
                        <dt>
                            <div className="absolute rounded-md bg-primary-500 p-3">
                                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                        </dt>
                        <dd className="ml-16 flex items-baseline pb-1 sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                            <p
                                className={classNames(
                                    item.changeType === 'increase' ? 'text-green-600' : 'text-red-600',
                                    'ml-2 flex items-baseline text-sm font-semibold'
                                )}
                            >
                                {item.changeType === 'increase' ? '↑' : '↓'} {item.change}
                            </p>
                        </dd>
                    </div>
                ))}
            </div>

            <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Actividad Reciente</h3>
                <ul className="divide-y divide-gray-200">
                    <li className="py-4 flex justify-between">
                        <span className="text-gray-700">Nueva reserva para Yoga Principiantes</span>
                        <span className="text-gray-500 text-sm">Hace 5 min</span>
                    </li>
                    <li className="py-4 flex justify-between">
                        <span className="text-gray-700">Artículo "Los 8 pasos del Yoga" actualizado</span>
                        <span className="text-gray-500 text-sm">Hace 2 horas</span>
                    </li>
                    <li className="py-4 flex justify-between">
                        <span className="text-gray-700">Nuevo comentario en Google Maps</span>
                        <span className="text-gray-500 text-sm">Hace 1 día</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
