import React from 'react';

export default function SeoStats() {
    return (
        <div>
            <h1 className="text-2xl font-semibold leading-6 text-gray-900 mb-8">SEO & Google Analytics</h1>

            <div className="bg-white shadow rounded-lg p-8 text-center border border-gray-200 max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
                        alt="Google Logo"
                        className="h-10"
                    />
                    <span className="ml-4 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-widest">
                        Verificado
                    </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">Google Search Console Conectado</h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    Tu sitio ya está verificado en Google. Los datos de búsqueda (clics, impresiones y posición) tardarán entre 24 y 48 horas en empezar a aparecer aquí.
                </p>

                <a
                    href="https://search.google.com/search-console?resource_id=https://www.yogayterapiasarunachala.es/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-x-2 rounded-md bg-forest px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-matcha transition-all"
                >
                    Ir a Google Search Console
                </a>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 blur-sm select-none opacity-50 relative pointer-events-none">
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    {/* Overlay handled by blur, no extra content needed */}
                </div>
                {/* Fake charts for background visual */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-lg shadow border border-gray-100 h-64 flex flex-col justify-between">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-32 w-full bg-gray-100 rounded flex items-end justify-around pb-2">
                            <div className="w-8 h-20 bg-primary-200 rounded-t"></div>
                            <div className="w-8 h-12 bg-primary-200 rounded-t"></div>
                            <div className="w-8 h-24 bg-primary-200 rounded-t"></div>
                            <div className="w-8 h-16 bg-primary-200 rounded-t"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
