import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';
import lotusFlower from '../assets/images/lotus_flower.png';

interface BlogPost {
    id: number;
    title: string;
    body: string | null;
    type: string;
    status: string;
    thumbnail_url: string | null;
    translations: any;
    created_at: string;
}

const BlogPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/content?type=article`);
                if (response.ok) {
                    const data = await response.json();
                    // Filter only published ones if needed, or handle in backend
                    setPosts(data.filter((p: BlogPost) => p.status === 'published'));
                }
            } catch (error) {
                console.error("Error fetching blog posts:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString(i18n.language === 'en' ? 'en-US' : (i18n.language === 'ca' ? 'ca-ES' : 'es-ES'), options);
    };

    return (
        <div className="font-body text-bark min-h-screen flex flex-col pt-24">
            <Header />
            <main className="flex-grow bg-bone">
                <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
                    <BackButton />
                    <h1 className="text-4xl md:text-6xl font-headers text-forest mb-12 text-center uppercase">{t('yoga.sections.blog')}</h1>

                    {isLoading ? (
                        <div className="text-center py-20 text-forest font-headers text-2xl animate-pulse">
                            {t('home.loading.experience')}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.length > 0 ? (
                                posts.map(post => (
                                    <article key={post.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-forest/5 flex flex-col">
                                        <div className="h-56 overflow-hidden bg-forest/5 flex items-center justify-center">
                                            {post.thumbnail_url ? (
                                                <img
                                                    src={post.thumbnail_url.startsWith('http') ? post.thumbnail_url : `${API_BASE_URL}${post.thumbnail_url}`}
                                                    alt={getTranslated(post, 'title', i18n.language)}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <img src={lotusFlower} className="w-20 opacity-20" alt="" />
                                            )}
                                        </div>
                                        <div className="p-6 flex-grow flex flex-col">
                                            <span className="text-xs font-bold text-matcha uppercase tracking-widest">{formatDate(post.created_at)}</span>
                                            <h3 className="text-xl font-headers text-forest mt-2 mb-3 group-hover:text-matcha transition-colors uppercase">
                                                {getTranslated(post, 'title', i18n.language)}
                                            </h3>
                                            <p className="text-bark/80 text-sm leading-relaxed mb-4 line-clamp-3">
                                                {getTranslated(post, 'body', i18n.language)?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                            </p>
                                            <div className="mt-auto">
                                                <button className="text-forest font-bold text-sm border-b border-forest/30 hover:border-forest transition-colors uppercase">
                                                    {t('yoga.common.read_article')}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 bg-white/50 rounded-2xl border-2 border-dashed border-forest/10">
                                    <p className="text-bark/50 font-headers text-xl">{t('yoga.none.blog') || "Próximamente más artículos..."}</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default BlogPage;
