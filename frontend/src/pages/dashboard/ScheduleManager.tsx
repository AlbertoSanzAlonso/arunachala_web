import React from 'react';

const schedule = [
    { day: 'Lunes', time: '09:00 - 10:30', class: 'Hatha Yoga', instructor: 'María', room: 'Sala Sol' },
    { day: 'Lunes', time: '18:00 - 19:30', class: 'Vinyasa Flow', instructor: 'Juan', room: 'Sala Luna' },
    { day: 'Martes', time: '10:00 - 11:30', class: 'Yoga Suave', instructor: 'Elena', room: 'Sala Sol' },
    { day: 'Miércoles', time: '19:00 - 20:30', class: 'Meditación', instructor: 'María', room: 'Sala Silencio' },
];

export default function ScheduleManager() {
    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold leading-6 text-gray-900">Gestión de Horarios</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Administra las clases semanales, profesores y salas disponibles.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                    >
                        Añadir Clase
                    </button>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Simple List View for now */}
                <div className="overflow-hidden bg-white shadow sm:rounded-md border border-gray-200">
                    <ul role="list" className="divide-y divide-gray-200">
                        {schedule.map((item, index) => (
                            <li key={index}>
                                <div className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="truncate text-sm font-medium text-primary-600">{item.class}</p>
                                            <div className="ml-2 flex flex-shrink-0">
                                                <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                    {item.day}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    🕒 {item.time}
                                                </p>
                                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:ml-6 sm:mt-0">
                                                    👤 {item.instructor}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <p>📍 {item.room}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Placeholder for Calendar Widget */}
                <div className="rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex flex-col justify-center items-center">
                    <span className="text-5xl mb-4">📅</span>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Vista de Calendario</h3>
                    <p className="mt-1 text-sm text-gray-500">Próximamente podrás arrastrar y soltar clases.</p>
                </div>
            </div>
        </div>
    );
}
