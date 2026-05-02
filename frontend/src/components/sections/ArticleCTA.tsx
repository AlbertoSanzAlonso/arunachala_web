import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const ArticleCTA: React.FC = () => {
    const { t } = useTranslation();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="my-16 p-1 bg-gradient-to-br from-matcha/40 via-forest/20 to-matcha/40 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        >
            {/* Decorative Orbs */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-matcha/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-forest/20 rounded-full blur-3xl" />

            <div className="bg-white/80 backdrop-blur-md rounded-[2.4rem] p-8 md:p-12 text-center relative z-10 border border-white/50">
                <span className="inline-block px-4 py-1.5 bg-matcha/20 text-forest text-sm font-bold rounded-full mb-6 tracking-wider uppercase">
                    {t('common.cta_label', '¿Sientes el llamado?')}
                </span>
                
                <h3 className="text-3xl md:text-4xl font-headers text-bark mb-6 leading-tight">
                    {t('common.cta_title', 'Empieza tu camino hacia el bienestar hoy mismo')}
                </h3>
                
                <p className="text-bark/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                    {t('common.cta_description', 'Únete a nuestras clases de yoga o reserva una sesión de terapia personalizada para reconectar con tu esencia.')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link 
                        to="/actividades"
                        className="px-10 py-4 bg-forest text-white rounded-2xl font-bold text-lg hover:bg-matcha hover:scale-105 transition-all shadow-xl shadow-forest/20 flex items-center gap-2 group"
                    >
                        {t('common.view_activities', 'Ver Actividades')}
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={2.5} 
                            stroke="currentColor" 
                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                    
                    <Link 
                        to="/contacto"
                        className="px-10 py-4 bg-white text-forest border-2 border-forest/20 rounded-2xl font-bold text-lg hover:bg-forest/5 hover:border-forest/40 transition-all"
                    >
                        {t('common.contact_us', 'Contactar')}
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default ArticleCTA;
