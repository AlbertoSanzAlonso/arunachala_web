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
            className="my-12 w-full max-w-2xl mx-auto"
        >
            <div className="bg-gradient-to-br from-forest/5 to-matcha/5 rounded-3xl p-8 md:p-10 border border-forest/10 text-center relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-matcha/5 rounded-full blur-2xl group-hover:bg-matcha/10 transition-colors" />
                
                <h3 className="text-xl md:text-2xl font-headers text-forest uppercase tracking-widest mb-4">
                    {t('blog.cta.question', '¿Te ha servido este artículo?')}
                </h3>
                
                <p className="text-bark/70 text-base mb-8 max-w-md mx-auto leading-relaxed">
                    {t('blog.cta.description', 'Si tienes alguna duda o quieres profundizar en estos temas, no dudes en escribirnos.')}
                </p>

                <Link 
                    to="/contacto"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-forest text-white rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-matcha hover:shadow-lg hover:shadow-forest/20 transition-all group/btn"
                >
                    {t('blog.cta.button', 'Contactar con nosotros')}
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={2} 
                        stroke="currentColor" 
                        className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                </Link>
            </div>
        </motion.div>
    );
};

export default ArticleCTA;
