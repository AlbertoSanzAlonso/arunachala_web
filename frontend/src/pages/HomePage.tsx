import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import videoBgWebm from '../assets/videos/hero_optimized.webm';
import yogaImg from '../assets/images/gallery/yoga_sample.webp';
import therapyImg from '../assets/images/gallery/therapy_sample.webp';
import gardenImg from '../assets/images/gallery/garden_sample.webp';
import omSymbol from '../assets/images/om_symbol.png';
import lotusFlower from '../assets/images/lotus_flower.png';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FadeInSection from '../components/FadeInSection';

// Lazy load heavy components
const ImageSlider = lazy(() => import('../components/ImageSlider'));
const ReviewsSection = lazy(() => import('../components/ReviewsSection'));
const WellnessQuiz = lazy(() => import('../components/WellnessQuiz'));

const MANTRAS = [
    { text: "Lokah Samastah Sukhino Bhavantu", translation: "Que todos los seres en todas partes sean felices y libres" },
    { text: "Om Namah Shivaya", translation: "Honro la divinidad que habita en mí" },
    { text: "Sat Nam", translation: "La verdad es mi identidad" },
    { text: "Om Mani Padme Hum", translation: "La joya en el loto de mi corazón" },
    { text: "Aham Brahmasmi", translation: "Yo soy la totalidad del universo" }
];

const getDailyMantra = () => {
    const today = new Date();
    const index = (today.getDate() + today.getMonth()) % MANTRAS.length;
    return MANTRAS[index];
};

const HomePage: React.FC = () => {


    return (
        <div className="font-body text-bark relative">
            <Header />

            {/* Hero Section with Video */}
            <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover opacity-85"
                    autoPlay
                    loop
                    muted
                    playsInline
                >
                    <source src={videoBgWebm} type="video/webm" />
                    Your browser does not support the video tag.
                </video>
                {/* Overlay */}
                <div className="absolute top-0 left-0 w-full h-full bg-black/30"></div>

                {/* Main Content Container */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-4 gap-6 md:gap-16 pt-28 pb-12 md:pt-0 md:pb-0">

                    {/* Navigation Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 w-full text-center">
                        <Link
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            to="/yoga"
                            className="group cursor-pointer p-6 md:p-8 border-2 border-transparent hover:border-bone/50 rounded-xl transition-all duration-500 bg-black/20 hover:bg-black/40 backdrop-blur-sm flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-bone/50"
                        >
                            <img src={omSymbol} alt="" aria-hidden="true" className="h-14 md:h-20 w-auto mb-3 md:mb-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 drop-shadow-lg" />
                            <h2 className="text-3xl md:text-6xl font-headers text-bone mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-500">YOGA</h2>
                            <p className="text-bone/80 text-base md:text-lg opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                                Muévete y respira
                            </p>
                        </Link>

                        <Link
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            to="/therapies"
                            className="group cursor-pointer p-6 md:p-8 border-2 border-transparent hover:border-bone/50 rounded-xl transition-all duration-500 bg-black/20 hover:bg-black/40 backdrop-blur-sm flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-bone/50"
                        >
                            <img src={lotusFlower} alt="" aria-hidden="true" className="h-14 md:h-20 w-auto mb-3 md:mb-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 drop-shadow-lg" />
                            <h2 className="text-3xl md:text-6xl font-headers text-bone mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-500">MASAJES</h2>
                            <p className="text-bone/80 text-base md:text-lg opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                                Recupera tu bienestar
                            </p>
                        </Link>
                    </div>

                    {/* Mantra of the Day Section */}
                    <div className="text-center animate-fade-in max-w-2xl px-6 py-6 rounded-2xl bg-black/10 backdrop-blur-sm border border-bone/10 shadow-2xl hover:bg-black/20 transition-all duration-700">
                        <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-bone/60 mb-4 font-light">Mantra del Día</p>
                        <h3 className="text-2xl md:text-4xl font-serif italic text-bone mb-3 leading-relaxed drop-shadow-md">
                            "{getDailyMantra().text}"
                        </h3>
                        <p className="text-bone/70 text-sm md:text-base font-light italic">
                            — {getDailyMantra().translation}
                        </p>
                    </div>

                </div>
            </section>

            {/* Content Sections */}
            <main className="bg-bone relative z-10">
                {/* Wellness Quiz Section */}
                <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading Experience...</div>}>
                    <FadeInSection>
                        <WellnessQuiz />
                    </FadeInSection>
                </Suspense>

                {/* Gallery Slider - MOVED BEFORE REVIEWS */}
                <section className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-12">
                    {/* Added margin to separate from Quiz */}
                    <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading Gallery...</div>}>
                        <FadeInSection delay={0.2}>
                            <ImageSlider images={[yogaImg, therapyImg, gardenImg]} />
                        </FadeInSection>
                    </Suspense>
                </section>

                {/* Reviews Section */}
                <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading Reviews...</div>}>
                    <FadeInSection delay={0.3}>
                        <ReviewsSection />
                    </FadeInSection>
                </Suspense>
            </main>

            <Footer />
        </div>
    );
};

export default HomePage;
