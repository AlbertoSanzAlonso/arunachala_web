
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../config';
import { Helmet } from 'react-helmet-async';
import { PlayCircleIcon, PauseCircleIcon } from '@heroicons/react/24/solid';

interface Meditation {
    id: number;
    title: string;
    excerpt?: string;
    media_url?: string;
    thumbnail_url?: string;
}

const MeditationsPage: React.FC = () => {
    const { t } = useTranslation();
    const [meditations, setMeditations] = useState<Meditation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [playingId, setPlayingId] = useState<number | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        const fetchMeditations = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/content?type=meditation&status=published`);
                if (response.ok) {
                    const data = await response.json();
                    setMeditations(data);
                }
            } catch (error) {
                console.error("Error fetching meditations", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMeditations();
    }, []);

    const handlePlay = (url: string, id: number) => {
        if (playingId === id && audio) {
            audio.pause();
            setPlayingId(null);
        } else {
            if (audio) {
                audio.pause();
            }
            const newAudio = new Audio(url.startsWith('http') ? url : `${API_BASE_URL}${url}`);
            newAudio.play();
            newAudio.onended = () => setPlayingId(null);
            setAudio(newAudio);
            setPlayingId(id);
        }
    };

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative bg-bone">
            <Helmet>
                <title>{t('menu.meditations')} | Arunachala</title>
                <meta name="description" content="Meditaciones guiadas y mantras para tu paz interior." />
            </Helmet>

            <Header />

            <main className="flex-grow pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-4xl md:text-6xl font-headers text-forest text-center mb-6 uppercase tracking-wider">
                        {t('menu.meditations')}
                    </h1>
                    <p className="text-center text-xl text-bark/80 max-w-2xl mx-auto mb-16">
                        Encuentra un momento de calma y conexión con nuestras meditaciones guiadas y mantras.
                    </p>

                    {isLoading ? (
                        <div className="text-center py-20">Cargando meditaciones...</div>
                    ) : meditations.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 italic">
                            Próximamente compartiremos nuevas meditaciones contigo.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {meditations.map((meditation) => (
                                <div key={meditation.id} className="bg-white rounded-3xl shadow-lg overflow-hidden border border-bone hover:shadow-xl transition-all duration-300 group">
                                    <div className="relative h-48 bg-matcha/20 flex items-center justify-center overflow-hidden">
                                        {meditation.thumbnail_url ? (
                                            <img src={meditation.thumbnail_url} alt={meditation.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-forest/30 to-matcha/30" />
                                        )}

                                        <button
                                            onClick={() => meditation.media_url && handlePlay(meditation.media_url, meditation.id)}
                                            className="absolute bg-white/90 rounded-full p-3 shadow-lg hover:scale-110 transition-transform duration-200 z-10"
                                        >
                                            {playingId === meditation.id ? (
                                                <PauseCircleIcon className="w-12 h-12 text-forest" />
                                            ) : (
                                                <PlayCircleIcon className="w-12 h-12 text-forest" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-2xl font-headers text-forest mb-2">{meditation.title}</h3>
                                        <p className="text-bark/80 line-clamp-3">{meditation.excerpt}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default MeditationsPage;
