import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Simple Icon Components for cleaner footer code
const InstagramIcon = (props: React.ComponentProps<'svg'>) => (
    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
);

const YoutubeIcon = (props: React.ComponentProps<'svg'>) => (
    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

const SpotifyIcon = (props: React.ComponentProps<'svg'>) => (
    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.299z" />
    </svg>
);


const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-[#5c6b3c] text-[#F5F5DC] font-light transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">

                {/* Brand & Address */}
                <div className="md:col-span-1 flex flex-col gap-6 text-center">
                    <h3 className="text-2xl font-headers tracking-widest text-[#F5F5DC] font-bold">ARUNACHALA</h3>
                    <address className="not-italic">
                        <a
                            href="https://www.google.com/maps/search/?api=1&query=Yoga+y+Terapias+Arunachala"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#F5F5DC]/90 leading-relaxed text-sm hover:text-[#becf81] transition-colors"
                        >
                            Yoga y Terapias Arunachala<br />
                            Pasaje de Mateu Oliva 3, bajos<br />
                            (junto Plaza Pallars)<br />
                            08940 Cornellà de Llobregat<br />
                            Barcelona
                        </a>
                    </address>
                    <p className="text-[#F5F5DC]/80 text-sm">
                        <a href="mailto:yogayterapiasarunachala@gmail.com" className="hover:text-[#becf81] transition-colors">yogayterapiasarunachala@gmail.com</a>
                        <br />
                        <a href="tel:+34678481971" className="hover:text-[#becf81] transition-colors">Tel. 678 481 971</a>
                    </p>
                </div>

                {/* Sitemap */}
                <div className="col-span-1 flex flex-col gap-6 text-center">
                    <h3 className="text-2xl font-headers tracking-widest text-transparent select-none hidden md:block" aria-hidden="true">_</h3>
                    <ul className="flex flex-col gap-3 text-sm text-[#F5F5DC]/80">
                        <li><Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:text-[#becf81] hover:translate-x-1 transition-all inline-block">{t('footer.labels.home')}</Link></li>
                        <li><Link to="/clases-de-yoga" onClick={() => window.scrollTo(0, 0)} className="hover:text-[#becf81] hover:translate-x-1 transition-all inline-block">{t('footer.labels.yoga')}</Link></li>
                        <li><Link to="/terapias-y-masajes" onClick={() => window.scrollTo(0, 0)} className="hover:text-[#becf81] hover:translate-x-1 transition-all inline-block">{t('footer.labels.therapies')}</Link></li>
                        <li><span className="opacity-50">{t('footer.labels.blog')}</span></li>
                    </ul>
                </div>

                {/* Legal */}
                <div className="col-span-1 flex flex-col gap-6 text-center">
                    <h3 className="text-2xl font-headers tracking-widest text-transparent select-none hidden md:block" aria-hidden="true">_</h3>
                    <ul className="flex flex-col gap-3 text-sm text-[#F5F5DC]/80">
                        <li><Link to="/aviso-legal" onClick={() => window.scrollTo(0, 0)} className="hover:text-[#becf81] transition-colors">{t('footer.labels.legal')}</Link></li>
                        <li><Link to="/politica-de-privacidad" onClick={() => window.scrollTo(0, 0)} className="hover:text-[#becf81] transition-colors">{t('footer.labels.privacy')}</Link></li>
                    </ul>
                </div>

                {/* Socials */}
                <div className="col-span-1 flex flex-col gap-6 items-center text-center lg:h-full lg:justify-between">
                    <h3 className="text-2xl font-headers tracking-widest text-transparent select-none hidden md:block" aria-hidden="true">_</h3>
                    <div className="flex gap-6">
                        <a href="https://www.instagram.com/yogayterapiasarunachala/" target="_blank" rel="noopener noreferrer" aria-label={t('footer.labels.instagram')} className="text-[#F5F5DC]/80 hover:text-[#becf81] hover:scale-110 transition-all duration-300">
                            <InstagramIcon className="w-6 h-6" aria-hidden="true" />
                        </a>
                        <a href="https://www.youtube.com/@yogayterapiasarunachala2252" target="_blank" rel="noopener noreferrer" aria-label={t('footer.labels.youtube')} className="text-[#F5F5DC]/80 hover:text-[#becf81] hover:scale-110 transition-all duration-300">
                            <YoutubeIcon className="w-6 h-6" aria-hidden="true" />
                        </a>
                        <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" aria-label={t('footer.labels.spotify')} className="text-[#F5F5DC]/80 hover:text-[#becf81] hover:scale-110 transition-all duration-300">
                            <SpotifyIcon className="w-6 h-6" aria-hidden="true" />
                        </a>
                    </div>
                </div>

            </div>

            {/* Copyright Bar */}
            <div className="w-full bg-black/20 py-6 text-center border-t border-[#F5F5DC]/10">
                <p className="text-xs text-[#F5F5DC]/40 uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Arunachala Web. {t('footer.rights')}
                </p>
            </div>
        </footer>
    );
};

export default Footer;
