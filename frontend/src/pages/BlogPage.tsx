import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';

const blogPosts = [
    {
        id: 1,
        title: "Beneficios del Yoga Matuino",
        excerpt: "Descubre cómo empezar tu día con energía y claridad mental a través de una práctica suave.",
        date: "20 Diciembre 2025",
        image: "https://images.unsplash.com/photo-1544367563-121955377435?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Meditación para Principiantes",
        excerpt: "Guía paso a paso para incorporar la meditación en tu rutina diaria sin estrés.",
        date: "15 Enero 2026",
        image: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Alimentación Consciente",
        excerpt: "Cómo la nutrición influye en tu práctica de yoga y bienestar general.",
        date: "22 Enero 2026",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"
    }
];

const BlogPage: React.FC = () => {
    return (
        <div className="font-body text-bark min-h-screen flex flex-col pt-24">
            <Header />
            <main className="flex-grow bg-bone">
                <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
                    <BackButton />
                    <h1 className="text-4xl md:text-6xl font-headers text-forest mb-12 text-center">Blog & Reflexiones</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map(post => (
                            <article key={post.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-forest/5">
                                <div className="h-56 overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <div className="p-6">
                                    <span className="text-xs font-bold text-matcha uppercase tracking-widest">{post.date}</span>
                                    <h3 className="text-xl font-headers text-forest mt-2 mb-3 group-hover:text-matcha transition-colors">{post.title}</h3>
                                    <p className="text-bark/80 text-sm leading-relaxed mb-4">{post.excerpt}</p>
                                    <button className="text-forest font-bold text-sm border-b border-forest/30 hover:border-forest transition-colors">Leer más</button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default BlogPage;
