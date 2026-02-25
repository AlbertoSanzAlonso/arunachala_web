import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../config';
import {
    CursorArrowRaysIcon,
    EyeIcon,
    ArrowTrendingUpIcon,
    MapPinIcon,
    ExclamationTriangleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

interface SeoData {
    status: string;
    stats: {
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    };
    history: Array<{
        date: string;
        clicks: number;
        impressions: number;
    }>;
    message?: string;
}

export default function SeoStats() {
    const [data, setData] = useState<SeoData | null>(null);
    const [yogaRankings, setYogaRankings] = useState<any[]>([]);
    const [therapyRankings, setTherapyRankings] = useState<any[]>([]);
    const [meditationRankings, setMeditationRankings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const token = sessionStorage.getItem('access_token');
            try {
                const response = await fetch(`${API_BASE_URL}/api/seo/stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const result = await response.json();
                setData(result);

                // Fetch rankings
                const yogaReq = await fetch(`${API_BASE_URL}/api/content/ranking?type=article&category=yoga&limit=10`);
                if (yogaReq.ok) setYogaRankings(await yogaReq.json());

                const therapyReq = await fetch(`${API_BASE_URL}/api/content/ranking?type=article&category=therapy&limit=10`);
                if (therapyReq.ok) setTherapyRankings(await therapyReq.json());

                const medReq = await fetch(`${API_BASE_URL}/api/content/ranking?type=meditation&limit=10`);
                if (medReq.ok) setMeditationRankings(await medReq.json());

            } catch (err) {
                console.error("Error fetching SEO stats:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
            </div>
        );
    }

    if (data?.status === 'not_configured' || data?.status === 'error') {
        return (
            <div className="max-w-4xl mx-auto py-10">
                <div className="bg-white rounded-2xl shadow-sm border border-bark/10 p-12 text-center">
                    <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-headers text-forest mb-4">Integración en Proceso</h2>
                    <p className="text-bark/60 mb-8 max-w-md mx-auto">
                        Hemos configurado las credenciales, pero Google todavía está validando la conexión o procesando los datos.
                        {data.message && <span className="block mt-2 text-xs italic">Detalle: {data.message}</span>}
                    </p>
                    <a
                        href="https://search.google.com/search-console?resource_id=https://www.yogayterapiasarunachala.es/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-forest text-white px-8 py-3 rounded-full hover:bg-matcha transition-all font-bold shadow-lg"
                    >
                        Ver en Google Search Console
                    </a>
                </div>
            </div>
        );
    }

    const stats = [
        { name: 'Clics Totales', value: data?.stats.clicks, icon: CursorArrowRaysIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Impresiones', value: data?.stats.impressions, icon: EyeIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
        { name: 'CTR Medio', value: `${data?.stats.ctr}%`, icon: ArrowTrendingUpIcon, color: 'text-green-600', bg: 'bg-green-50' },
        { name: 'Posición Media', value: data?.stats.position, icon: MapPinIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    // Find max impressions for scaling the chart
    const maxImpressions = Math.max(...(data?.history.map(h => h.impressions) || [1]), 10);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-headers text-forest mb-2">Rendimiento en Google</h1>
                <p className="text-bark/60">Datos de los últimos 30 días procedentes de Google Search Console.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-bark/5 hover:shadow-md transition-shadow"
                    >
                        <dt>
                            <div className={`absolute rounded-xl ${item.bg} p-3`}>
                                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-bark/40 uppercase tracking-widest">{item.name}</p>
                        </dt>
                        <dd className="ml-16 flex items-baseline">
                            <p className="text-2xl font-bold text-bark">{item.value}</p>
                        </dd>
                    </motion.div>
                ))}
            </div>

            {/* Main Chart Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-bark/5 p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-headers text-forest italic">Historial de Visibilidad</h3>
                    <div className="flex gap-4 text-xs font-headers uppercase tracking-widest text-bark/40">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>Clics</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-200 rounded-full"></div>
                            <span>Impresiones</span>
                        </div>
                    </div>
                </div>

                {data?.status === 'no_data' ? (
                    <div className="h-64 flex flex-col items-center justify-center text-bark/30 italic">
                        <ArrowTrendingUpIcon className="h-12 w-12 mb-4 opacity-20" />
                        <p>Aún no hay datos históricos suficientes.</p>
                    </div>
                ) : (
                    <div className="relative h-80 w-full flex items-end justify-center md:justify-evenly gap-2 md:gap-4 px-2">
                        {data?.history.map((day, idx) => (
                            <div key={idx} className="group relative flex-grow max-w-[30px] md:max-w-[45px] flex flex-col items-center gap-2 h-full justify-end">
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                    <div className="bg-bark text-white text-[10px] px-3 py-2 rounded-lg shadow-xl min-w-[100px]">
                                        <p className="font-bold border-b border-white/10 mb-1 pb-1">{day.date}</p>
                                        <p>Clics: {day.clicks}</p>
                                        <p>Imp: {day.impressions}</p>
                                    </div>
                                </div>

                                {/* Bars */}
                                <div className="w-full flex flex-col items-center justify-end h-full">
                                    {/* Impression Bar (Background) */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(day.impressions / maxImpressions) * 100}%` }}
                                        className="w-full bg-purple-100 rounded-t-sm md:rounded-t-md transition-colors group-hover:bg-purple-200 relative"
                                    >
                                        {/* Clicks Bar (Foreground) */}
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: day.impressions > 0 ? `${(day.clicks / day.impressions) * 100}%` : '0%' }}
                                            className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-sm md:rounded-t-md min-h-[2px]"
                                            style={{ maxHeight: '100%' }}
                                        />
                                    </motion.div>
                                </div>
                                <span className="text-[8px] md:text-[10px] text-bark/20 rotate-45 origin-left md:rotate-0 truncate max-w-full">
                                    {(data?.history?.length || 0) < 10 || idx % 5 === 0 ? day.date.split('-').slice(1).reverse().join('/') : ''}
                                </span>
                            </div>
                        ))}

                        {/* Fake Y-Axis Lines */}
                        <div className="absolute inset-0 pointer-events-none border-b border-bark/10">
                            <div className="h-full border-t border-bark/5 border-dashed"></div>
                            <div className="absolute top-1/2 left-0 right-0 border-t border-bark/5 border-dashed"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* CTA to real console */}
            <div className="flex justify-center pt-4">
                <a
                    href="https://search.google.com/search-console?resource_id=https://www.yogayterapiasarunachala.es/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-forest text-sm font-bold flex items-center gap-2 hover:text-matcha transition-colors"
                >
                    Explorar análisis avanzado en Google Search Console
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>

            {/* Content Rankings */}
            <div className="pt-8 space-y-8">
                <div>
                    <h2 className="text-2xl font-headers text-forest mb-2">Rankings de Contenido</h2>
                    <p className="text-bark/60">Los 10 contenidos más vistos por categoría y tiempos de reproducción de las meditaciones.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Yoga */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-bark/5 hover:shadow-md transition-shadow h-full">
                        <h3 className="text-lg font-bold text-forest mb-4 flex items-center gap-2">
                            🌿 Artículos de Yoga
                        </h3>
                        <ul className="divide-y divide-gray-50 flex flex-col h-full">
                            {yogaRankings.length === 0 ? (
                                <p className="text-sm text-gray-400 italic text-center py-4">No hay datos</p>
                            ) : (
                                yogaRankings.map((item, index) => (
                                    <li key={item.id} className="py-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-forest/10 text-forest flex items-center justify-center text-xs font-bold">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm text-bark font-medium truncate" title={item.title}>
                                                {item.title}
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap">
                                            <EyeIcon className="w-4 h-4" /> {item.view_count || 0}
                                        </span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    {/* Therapy */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-bark/5 hover:shadow-md transition-shadow h-full">
                        <h3 className="text-lg font-bold text-forest mb-4 flex items-center gap-2">
                            🌸 Artículos de Terapia
                        </h3>
                        <ul className="divide-y divide-gray-50 flex flex-col h-full">
                            {therapyRankings.length === 0 ? (
                                <p className="text-sm text-gray-400 italic text-center py-4">No hay datos</p>
                            ) : (
                                therapyRankings.map((item, index) => (
                                    <li key={item.id} className="py-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-forest/10 text-forest flex items-center justify-center text-xs font-bold">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm text-bark font-medium truncate" title={item.title}>
                                                {item.title}
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap">
                                            <EyeIcon className="w-4 h-4" /> {item.view_count || 0}
                                        </span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    {/* Meditations */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-bark/5 hover:shadow-md transition-shadow h-full">
                        <h3 className="text-lg font-bold text-forest mb-4 flex items-center gap-2">
                            ☁️ Meditaciones
                        </h3>
                        <ul className="divide-y divide-gray-50 flex flex-col h-full">
                            {meditationRankings.length === 0 ? (
                                <p className="text-sm text-gray-400 italic text-center py-4">No hay datos</p>
                            ) : (
                                meditationRankings.map((item, index) => {
                                    const avgSeconds = item.view_count > 0 ? Math.floor((item.play_time_seconds || 0) / item.view_count) : 0;
                                    return (
                                        <li key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-forest/10 text-forest flex items-center justify-center text-xs font-bold">
                                                    {index + 1}
                                                </span>
                                                <span className="text-sm text-bark font-medium truncate" title={item.title}>
                                                    {item.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 pr-1 justify-end ml-9 sm:ml-0">
                                                <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-gray-500 line-clamp-1 whitespace-nowrap bg-gray-50 px-2 py-0.5 sm:py-1 rounded-full">
                                                    <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {item.view_count || 0}
                                                </span>
                                                <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-purple-600 line-clamp-1 whitespace-nowrap bg-purple-50 px-2 py-0.5 sm:py-1 rounded-full" title="Tiempo Medio">
                                                    <ClockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    <span className="font-medium opacity-80 mr-0.5 hidden md:inline">Media:</span>
                                                    {avgSeconds < 60
                                                        ? `${avgSeconds}s`
                                                        : `${Math.floor(avgSeconds / 60)}m`}
                                                </span>
                                            </div>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
