
export const MOCK_MEDITATIONS = [
    {
        id: -1,
        title: "Meditación de Bondad Amorosa (Metta)",
        excerpt: "Una práctica poderosa para cultivar la compasión hacia uno mismo y hacia los demás.",
        media_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        thumbnail_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
        tags: ["compasión", "metta", "principiantes"],
        translations: {
            es: { title: "Meditación de Bondad Amorosa (Metta)", excerpt: "Una práctica poderosa para cultivar la compasión hacia uno mismo y hacia los demás." },
            en: { title: "Loving-Kindness Meditation (Metta)", excerpt: "A powerful practice to cultivate compassion towards oneself and others." },
            ca: { title: "Meditació de Bondat Amorosa (Metta)", excerpt: "Una pràctica poderosa per cultivar la compassió envers un mateix i envers els altres." }
        }
    },
    {
        id: -2,
        title: "Escaneo Corporal para el Sueño",
        excerpt: "Relaja cada parte de tu cuerpo y prepárate para un descanso profundo y reparador.",
        media_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        thumbnail_url: "https://images.unsplash.com/photo-1511295742364-917e70351634?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
        tags: ["sueño", "relax", "escaneo corporal"],
        translations: {
            es: { title: "Escaneo Corporal para el Sueño", excerpt: "Relaja cada parte de tu cuerpo y prepárate para un descanso profundo y reparador." },
            en: { title: "Body Scan for Sleep", excerpt: "Relax every part of your body and prepare for a deep and restorative rest." },
            ca: { title: "Escaneig Corporal per al Son", excerpt: "Relaxa cada part del teu cos i prepara't per a un descans profund i reparador." }
        }
    },
    {
        id: -3,
        title: "Respiración Consciente",
        excerpt: "Conecta con el momento presente a través de tu respiración natural.",
        media_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        thumbnail_url: "https://images.unsplash.com/photo-1447433589675-4aaa56a4010a?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
        tags: ["respiración", "mindfulness"],
        translations: {
            es: { title: "Respiración Consciente", excerpt: "Conecta con el momento presente a través de tu respiración natural." },
            en: { title: "Conscious Breathing", excerpt: "Connect with the present moment through your natural breath." },
            ca: { title: "Respiració Conscient", excerpt: "Connecta amb el moment present a través de la teva respiració natural." }
        }
    },
    {
        id: -4,
        title: "Visualización: El Bosque Interior",
        excerpt: "Un viaje imaginario por un bosque sereno para calmar la mente agitada.",
        media_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        thumbnail_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
        tags: ["visualización", "naturaleza"],
        translations: {
            es: { title: "Visualización: El Bosque Interior", excerpt: "Un viaje imaginario por un bosque sereno para calmar la mente agitada." },
            en: { title: "Visualization: The Inner Forest", excerpt: "An imaginary journey through a serene forest to calm the restless mind." },
            ca: { title: "Visualització: El Bosc Interior", excerpt: "Un viatge imaginari per un bosc serè per calmar la ment agitada." }
        }
    },
    {
        id: -5,
        title: "Meditación de Gratitud",
        excerpt: "Cultiva una actitud de aprecio por las pequeñas maravillas de la vida.",
        media_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        thumbnail_url: "https://images.unsplash.com/photo-1502120963575-bb3ed00dcca0?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
        tags: ["gratitud", "felicidad"],
        translations: {
            es: { title: "Meditación de Gratitud", excerpt: "Cultiva una actitud de aprecio por las pequeñas maravillas de la vida." },
            en: { title: "Gratitude Meditation", excerpt: "Cultivate an attitude of appreciation for life's small wonders." },
            ca: { title: "Meditació de Gratitud", excerpt: "Cultiva una actitud d'apreci per les petites meravelles de la vida." }
        }
    },
    {
        id: -6,
        title: "Alivio del Estrés Rápido",
        excerpt: "5 minutos para soltar la tensión cuando el día se vuelve abrumador.",
        media_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        thumbnail_url: "https://images.unsplash.com/photo-1499209974431-9dac3e74a1e4?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
        tags: ["estrés", "rápido"],
        translations: {
            es: { title: "Alivio del Estrés Rápido", excerpt: "5 minutos para soltar la tensión cuando el día se vuelve abrumador." },
            en: { title: "Quick Stress Relief", excerpt: "5 minutes to release tension when the day gets overwhelming." },
            ca: { title: "Allevi de l'Estrès Ràpid", excerpt: "5 minuts per deixar anar la tensió quan el dia es torna aclaparador." }
        }
    },
    {
        id: -7,
        title: "Foco y Concentración",
        excerpt: "Claridad mental para tus tareas diarias y estudio.",
        media_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        thumbnail_url: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
        tags: ["foco", "estudio"],
        translations: {
            es: { title: "Foco y Concentración", excerpt: "Claridad mental para tus tareas diarias y estudio." },
            en: { title: "Focus and Concentration", excerpt: "Mental clarity for your daily tasks and study." },
            ca: { title: "Foc i Concentració", excerpt: "Claredat mental per a les teves tasques diàries i estudi." }
        }
    },
    {
        id: -8,
        title: "Auto-amor y Aceptación",
        excerpt: "Abrázate tal como eres en este momento, sin juicios.",
        media_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        thumbnail_url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
        tags: ["autoestima", "amor"],
        translations: {
            es: { title: "Auto-amor y Aceptación", excerpt: "Abrázate tal como eres en este momento, sin juicios." },
            en: { title: "Self-Love and Acceptance", excerpt: "Embrace yourself as you are in this moment, without judgment." },
            ca: { title: "Autoamor i Acceptació", excerpt: "Abraça't tal com ets en aquest moment, sense judicis." }
        }
    },
    {
        id: -9,
        title: "Meditación Caminando",
        excerpt: "Pura consciencia en cada paso que das sobre la Tierra.",
        media_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        thumbnail_url: "https://images.unsplash.com/photo-1461151304267-38535e777497?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
        tags: ["movimiento", "naturaleza"],
        translations: {
            es: { title: "Meditación Caminando", excerpt: "Pura consciencia en cada paso que das sobre la Tierra." },
            en: { title: "Walking Meditation", excerpt: "Pure awareness in every step you take on Earth." },
            ca: { title: "Meditació Caminant", excerpt: "Pura consciència en cada pas que fas sobre la Terra." }
        }
    },
    {
        id: -10,
        title: "Paz Profunda",
        excerpt: "Sumérgete en el silencio que habita en el fondo de tu ser.",
        media_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        thumbnail_url: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
        tags: ["paz", "silencio"],
        translations: {
            es: { title: "Paz Profunda", excerpt: "Sumérgete en el silencio que habita en el fondo de tu ser." },
            en: { title: "Deep Peace", excerpt: "Immerse yourself in the silence that dwells at the core of your being." },
            ca: { title: "Pau Profunda", excerpt: "Submergeix-te en el silenci que habita en el fons del teu ésser." }
        }
    }
];

export const MOCK_ARTICLES = [
    {
        id: -1,
        title: "Los 5 Beneficios del Yoga al Despertar",
        slug: "beneficios-yoga-despertar",
        excerpt: "Descubre cómo una rutina corta de yoga por la mañana puede transformar todo tu día.",
        category: "yoga",
        thumbnail_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
        tags: ["salud", "rutina", "mañana"],
        created_at: new Date().toISOString(),
        translations: {
            es: { title: "Los 5 Beneficios del Yoga al Despertar" },
            en: { title: "The 5 Benefits of Yoga Upon Waking" },
            ca: { title: "Els 5 Beneficis del Ioga al Despertar" }
        }
    },
    {
        id: -2,
        title: "Terapias que Ayudan a Reducir el Estrés",
        slug: "terapias-reduccion-estres",
        excerpt: "Exploramos las técnicas más efectivas para calmar el sistema nervioso.",
        category: "therapy",
        thumbnail_url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80",
        tags: ["estrés", "bienestar", "terapias"],
        created_at: new Date().toISOString(),
        translations: {
            es: { title: "Terapias que Ayudan a Reducir el Estrés" },
            en: { title: "Therapies that Help Reduce Stress" },
            ca: { title: "Teràpies que Ajuden a Reduir l'Estrès" }
        }
    },
    {
        id: -3,
        title: "Yoga para el Dolor de Espalda",
        slug: "yoga-dolor-espalda",
        excerpt: "Posturas sencillas para aliviar la tensión lumbar.",
        category: "yoga",
        thumbnail_url: "https://images.unsplash.com/photo-1522844990219-49c1893f5d53?auto=format&fit=crop&w=800&q=80",
        tags: ["espalda", "posturas"],
        created_at: new Date().toISOString(),
        translations: {
            es: { title: "Yoga para el Dolor de Espalda" },
            en: { title: "Yoga for Back Pain" },
            ca: { title: "Ioga per al Dolor d'Esquena" }
        }
    },
    {
        id: -4,
        title: "Alimentación Consciente y Salud",
        slug: "alimentacion-consciente",
        excerpt: "Cómo lo que comes afecta a tu energía y estado de ánimo.",
        category: "therapy",
        thumbnail_url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
        tags: ["nutrición", "hábitos"],
        created_at: new Date().toISOString(),
        translations: {
            es: { title: "Alimentación Consciente" },
            en: { title: "Mindful Eating" },
            ca: { title: "Alimentació Conscient" }
        }
    },
    {
        id: -5,
        title: "La Historia Milenaria del Yoga",
        slug: "historia-del-yoga",
        excerpt: "Un viaje desde los Vedas hasta la práctica moderna.",
        category: "yoga",
        thumbnail_url: "https://images.unsplash.com/photo-1599447421416-3414502d18a5?auto=format&fit=crop&w=800&q=80",
        tags: ["historia", "filosofía"],
        created_at: new Date().toISOString(),
        translations: {
            es: { title: "Historia del Yoga" },
            en: { title: "History of Yoga" },
            ca: { title: "Història del Ioga" }
        }
    },
    {
        id: -6,
        title: "Beneficios del Masaje Terapéutico",
        slug: "beneficios-masaje",
        excerpt: "Más allá de la relajación, una herramienta de salud.",
        category: "therapy",
        thumbnail_url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80",
        tags: ["masaje", "recuperación"],
        created_at: new Date().toISOString(),
        translations: {
            es: { title: "Beneficios del Masaje" },
            en: { title: "Benefits of Massage" },
            ca: { title: "Beneficis del Massatge" }
        }
    },
    {
        id: -7,
        title: "Pranayama para Principiantes",
        slug: "pranayama-basico",
        excerpt: "Guía para empezar con las técnicas de respiración.",
        category: "yoga",
        thumbnail_url: "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&w=800&q=80",
        tags: ["pranayama", "respiración"],
        created_at: new Date().toISOString(),
        translations: {
            es: { title: "Pranayama Básico" },
            en: { title: "Basic Pranayama" },
            ca: { title: "Pranayama Bàsic" }
        }
    },
    {
        id: -8,
        title: "Cristales y Energía Vibracional",
        slug: "cristales-y-energia",
        excerpt: "Cómo usar gemas para equilibrar tus chakras.",
        category: "therapy",
        thumbnail_url: "https://images.unsplash.com/photo-1567103473247-68c4139247ad?auto=format&fit=crop&w=800&q=80",
        tags: ["energía", "chakras"],
        created_at: new Date().toISOString(),
        translations: {
            es: { title: "Cristales y Energía" },
            en: { title: "Crystals and Energy" },
            ca: { title: "Cristalls i Energia" }
        }
    },
    {
        id: -9,
        title: "Yoga en el Embarazo",
        slug: "yoga-embarazo",
        excerpt: "Práctica segura y beneficios para madre e hijo.",
        category: "yoga",
        thumbnail_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
        tags: ["embarazo", "maternidad"],
        created_at: new Date().toISOString(),
        translations: {
            es: { title: "Yoga en el Embarazo" },
            en: { title: "Yoga in Pregnancy" },
            ca: { title: "Ioga en l'Embaràs" }
        }
    },
    {
        id: -10,
        title: "Coherencia Cardíaca",
        slug: "coherencia-cardiaca",
        excerpt: "Sincroniza tu corazón y mente para el bienestar.",
        category: "therapy",
        thumbnail_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
        tags: ["corazón", "salud"],
        created_at: new Date().toISOString(),
        translations: {
            es: { title: "Coherencia Cardíaca" },
            en: { title: "Heart Coherence" },
            ca: { title: "Coherència Cardíaca" }
        }
    },
    {
        id: -11,
        title: "Guía del Saludo al Sol",
        slug: "guia-surya-namaskar",
        excerpt: "Domina la secuencia más famosa paso a paso.",
        category: "yoga",
        thumbnail_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
        tags: ["secuencia", "básico"],
        created_at: new Date().toISOString(),
        translations: {
            es: { title: "Guía del Saludo al Sol" },
            en: { title: "Sun Salutation Guide" },
            ca: { title: "Guia de la Salutació al Sol" }
        }
    }
];

export const MOCK_THERAPIES = [
    {
        id: -1,
        name: "Masaje Tailandés Tradicional",
        excerpt: "Técnica milenaria de estiramientos y presión.",
        description: "El masaje tailandés combina yoga asistido y presión rítmica.",
        benefits: "Mejora flexibilidad y alivia dolores musculares.",
        duration_min: 60,
        price: "60€",
        image_url: "https://images.unsplash.com/photo-1544161515-4ae6ce6ca67d?auto=format&fit=crop&w=800&q=80",
        translations: {
            es: { name: "Masaje Tailandés" },
            en: { name: "Thai Massage" },
            ca: { name: "Massatge Tailandès" }
        }
    },
    {
        id: -2,
        name: "Aromaterapia Relax",
        excerpt: "Paz profunda con aceites esenciales.",
        description: "Masaje suave con esencias naturales terapéuticas.",
        benefits: "Relajación total y equilibrio emocional.",
        duration_min: 45,
        price: "45€",
        image_url: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80",
        translations: {
            es: { name: "Aromaterapia" },
            en: { name: "Aromatherapy" },
            ca: { name: "Aromateràpia" }
        }
    },
    {
        id: -3,
        name: "Sesión de Shiatsu",
        excerpt: "Equilibrio energético con presión digital.",
        description: "Terapia japonesa basada en la medicina tradicional china.",
        benefits: "Regula el sistema nervioso y mejora la vitalidad.",
        duration_min: 60,
        price: "55€",
        image_url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80",
        translations: {
            es: { name: "Shiatsu" },
            en: { name: "Shiatsu" },
            ca: { name: "Shiatsu" }
        }
    },
    {
        id: -4,
        name: "Reflexología Podal",
        excerpt: "Tu salud reflejada en tus pies.",
        description: "Masaje en puntos reflejos del pie que conectan con órganos.",
        benefits: "Desintoxicación y alivio de tensiones orgánicas.",
        duration_min: 40,
        price: "40€",
        image_url: "https://images.unsplash.com/photo-1537160637206-54bcc33e1e91?auto=format&fit=crop&w=800&q=80",
        translations: {
            es: { name: "Reflexología Podal" },
            en: { name: "Foot Reflexology" },
            ca: { name: "Reflexologia Podal" }
        }
    },
    {
        id: -5,
        name: "Masaje Deportivo/Tejido Profundo",
        excerpt: "Liberación de contracturas intensas.",
        description: "Técnica focalizada en las capas profundas del músculo.",
        benefits: "Elimina nudos y mejora el rendimiento físico.",
        duration_min: 60,
        price: "65€",
        image_url: "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&w=800&q=80",
        translations: {
            es: { name: "Masaje Profundo" },
            en: { name: "Deep Tissue Massage" },
            ca: { name: "Massatge Profund" }
        }
    },
    {
        id: -6,
        name: "Terapia Ayurvédica",
        excerpt: "Sabiduría ancestral india para el cuerpo.",
        description: "Masaje Abhyanga con aceites tibios personalizados.",
        benefits: "Longevidad, hidratación y expulsión de toxinas.",
        duration_min: 90,
        price: "85€",
        image_url: "https://images.unsplash.com/photo-1544161515-4ae6ce6ca67d?auto=format&fit=crop&w=800&q=80",
        translations: {
            es: { name: "Terapia Ayurveda" },
            en: { name: "Ayurvedic Therapy" },
            ca: { name: "Teràpia Ayurveda" }
        }
    },
    {
        id: -7,
        name: "Sesión de Reiki",
        excerpt: "Sanación a través de la energía universal.",
        description: "Imposición de manos para armonizar los centros de energía.",
        benefits: "Paz mental y aceleración de procesos curativos.",
        duration_min: 50,
        price: "50€",
        image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
        translations: {
            es: { name: "Reiki" },
            en: { name: "Reiki" },
            ca: { name: "Reiki" }
        }
    },
    {
        id: -8,
        name: "Terapia Cráneo-Sacral",
        excerpt: "Toque sutil para la salud del sistema nervioso.",
        description: "Trabajo suave sobre los huesos del cráneo y sacro.",
        benefits: "Alivio de migrañas, bruxismo e insomnio.",
        duration_min: 60,
        price: "60€",
        image_url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80",
        translations: {
            es: { name: "Cráneo-Sacral" },
            en: { name: "Cranio-Sacral" },
            ca: { name: "Crani-Sacral" }
        }
    },
    {
        id: -9,
        name: "Drenaje Linfático Manual",
        excerpt: "Elimina líquidos y mejora la circulación.",
        description: "Movimientos circulares suaves para movilizar la linfa.",
        benefits: "Reduce inflamación y fortalece el sistema inmune.",
        duration_min: 75,
        price: "70€",
        image_url: "https://images.unsplash.com/photo-1544161515-4ae6ce6ca67d?auto=format&fit=crop&w=800&q=80",
        translations: {
            es: { name: "Drenaje Linfático" },
            en: { name: "Lymphatic Drainage" },
            ca: { name: "Drenatge Limfàtic" }
        }
    },
    {
        id: -10,
        name: "Masaje con Piedras Volcánicas",
        excerpt: "Calor profundo para relajar hasta el alma.",
        description: "Uso de piedras de basalto calientes en puntos clave.",
        benefits: "Sedación muscular y mejora del flujo sanguíneo.",
        duration_min: 90,
        price: "90€",
        image_url: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80",
        translations: {
            es: { name: "Piedras Calientes" },
            en: { name: "Hot Stones" },
            ca: { name: "Pedres Calentes" }
        }
    }
];

export const MOCK_SCHEDULES = [
    {
        id: -1, day_of_week: "Lunes", start_time: "09:30", end_time: "10:45", class_name: "Hatha Yoga",
        yoga_class: { name: "Hatha Yoga Suave", description: "Enfoque en alineación.", color: "bg-sage-100", age_range: "Adultos" }
    },
    {
        id: -2, day_of_week: "Miércoles", start_time: "18:00", end_time: "19:15", class_name: "Vinyasa Flow",
        yoga_class: { name: "Vinyasa Dinámico", description: "Fluye con la respiración.", color: "bg-matcha-100", age_range: "+16 años" }
    },
    {
        id: -3, day_of_week: "Viernes", start_time: "10:00", end_time: "11:00", class_name: "Yin Yoga",
        yoga_class: { name: "Yin Yoga Restaurativo", description: "Paz mental profunda.", color: "bg-bone-300", age_range: "Todos" }
    },
    {
        id: -4, day_of_week: "Martes", start_time: "09:00", end_time: "10:15", class_name: "Yoga Integral",
        yoga_class: { name: "Yoga Integral", description: "Cuerpo, mente y espíritu.", color: "bg-emerald-50", age_range: "Adultos" }
    },
    {
        id: -5, day_of_week: "Jueves", start_time: "19:30", end_time: "20:45", class_name: "Kundalini Yoga",
        yoga_class: { name: "Kundalini Yoga", description: "Energía y meditación.", color: "bg-yellow-50", age_range: "+18 años" }
    },
    {
        id: -6, day_of_week: "Martes", start_time: "18:30", end_time: "19:45", class_name: "Ashtanga Intro",
        yoga_class: { name: "Ashtanga Principiantes", description: "Primera serie guiada.", color: "bg-orange-50", age_range: "Activos" }
    }
];

export const MOCK_WEEKEND_ACTIVITIES = [
    {
        id: -1,
        type: "taller",
        title: "Taller de Pranayama",
        description: "Control de la energía vital.",
        start_date: new Date(new Date().setDate(new Date().getDate() + (6 - new Date().getDay()))).toISOString(),
        translations: { es: { title: "Taller de Pranayama" }, en: { title: "Pranayama Workshop" }, ca: { title: "Taller de Pranayama" } }
    },
    {
        id: -2,
        type: "evento",
        title: "Kirtan y Mantras",
        description: "Música para el corazón.",
        start_date: new Date(new Date().setDate(new Date().getDate() + (7 - new Date().getDay()))).toISOString(),
        translations: { es: { title: "Kirtan" }, en: { title: "Kirtan Night" }, ca: { title: "Kirtan" } }
    }
];

export const MOCK_ACTIVITIES = [
    {
        id: -1,
        title: "Retiro de Fin de Semana: Silencio y Presencia",
        description: "Desconecta del ruido en este retiro intensivo.",
        type: "retiro",
        start_date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
        end_date: new Date(new Date().setDate(new Date().getDate() + 16)).toISOString(),
        location: "Montseny, Barcelona", price: "250€",
        image_url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
        translations: { es: { title: "Retiro Silencio" }, en: { title: "Silence Retreat" }, ca: { title: "Retir Silenci" } }
    },
    {
        id: -2,
        title: "Taller de Cocina Saludable",
        description: "Nutre tu cuerpo con ingredientes de temporada.",
        type: "taller",
        start_date: new Date(new Date().setDate(new Date().getDate() + 21)).toISOString(),
        end_date: null,
        location: "Centro Arunachala", price: "40€",
        image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
        translations: { es: { title: "Cocina Saludable" }, en: { title: "Healthy Cooking" }, ca: { title: "Cuina Saludable" } }
    },
    {
        id: -3,
        title: "Meditación de Luna Llena",
        description: "Aprovecha la energía lunar en un círculo sagrado.",
        type: "evento",
        start_date: new Date(new Date().setDate(new Date().getDate() + 28)).toISOString(),
        end_date: null,
        location: "Plaza de la Paz", price: "Gratuito",
        image_url: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=800&q=80",
        translations: { es: { title: "Luna Llena" }, en: { title: "Full Moon Circle" }, ca: { title: "Lluna Plena" } }
    },
    {
        id: -4,
        title: "Introducción al Ayurveda",
        description: "Descubre tu dosha y vive en equilibrio.",
        type: "curso",
        start_date: new Date(new Date().setDate(new Date().getDate() + 35)).toISOString(),
        end_date: null,
        location: "Arunachala Sala A", price: "120€",
        image_url: "https://images.unsplash.com/photo-1544161515-4ae6ce6ca67d?auto=format&fit=crop&w=800&q=80",
        translations: { es: { title: "Curso Ayurveda" }, en: { title: "Ayurveda Intro" }, ca: { title: "Curs Ayurveda" } }
    },
    {
        id: -5,
        title: "Baño de Sonido (Cuencos)",
        description: "Relajación profunda a través del sonido.",
        type: "taller",
        start_date: new Date(new Date().setDate(new Date().getDate() + 42)).toISOString(),
        end_date: null,
        location: "Arunachala Sala B", price: "30€",
        image_url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
        translations: { es: { title: "Baño de Sonido" }, en: { title: "Sound Bath" }, ca: { title: "Bany de So" } }
    },
    {
        id: -6,
        title: "Danza Consciente",
        description: "Expresa tu ser a través del movimiento libre.",
        type: "evento",
        start_date: new Date(new Date().setDate(new Date().getDate() + 49)).toISOString(),
        end_date: null,
        location: "Sala Principal", price: "15€",
        image_url: "https://images.unsplash.com/photo-1461151304267-38535e777497?auto=format&fit=crop&w=800&q=80",
        translations: { es: { title: "Danza Consciente" }, en: { title: "Conscious Dance" }, ca: { title: "Dansa Conscient" } }
    },
    {
        id: -7,
        title: "Jornada de Permacultura",
        description: "Aprende a cuidar la tierra y a ti mismo.",
        type: "taller",
        start_date: new Date(new Date().setDate(new Date().getDate() + 56)).toISOString(),
        end_date: null,
        location: "Huerto Comunitario", price: "25€",
        image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
        translations: { es: { title: "Permacultura" }, en: { title: "Permaculture Day" }, ca: { title: "Permacultura" } }
    },
    {
        id: -8,
        title: "Arteterapia para el Alma",
        description: "Desbloquea tu creatividad sin miedos.",
        type: "taller",
        start_date: new Date(new Date().setDate(new Date().getDate() + 63)).toISOString(),
        end_date: null,
        location: "Arunachala Sala C", price: "45€",
        image_url: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80",
        translations: { es: { title: "Arteterapia" }, en: { title: "Art Therapy" }, ca: { title: "Artteràpia" } }
    },
    {
        id: -9,
        title: "Senderismo y Yoga",
        description: "Caminata por el Garraf con práctica de asanas.",
        type: "retiro",
        start_date: new Date(new Date().setDate(new Date().getDate() + 70)).toISOString(),
        end_date: null,
        location: "Parque Natural Garraf", price: "35€",
        image_url: "https://images.unsplash.com/photo-1447433589675-4aaa56a4010a?auto=format&fit=crop&w=800&q=80",
        translations: { es: { title: "Hiking & Yoga" }, en: { title: "Hiking & Yoga" }, ca: { title: "Senderisme i Ioga" } }
    },
    {
        id: -10,
        title: "Ceremonia de Té",
        description: "El arte de la presencia en una taza.",
        type: "evento",
        start_date: new Date(new Date().setDate(new Date().getDate() + 77)).toISOString(),
        end_date: null,
        location: "Arunachala Sala Zen", price: "20€",
        image_url: "https://images.unsplash.com/photo-1502120963575-bb3ed00dcca0?auto=format&fit=crop&w=800&q=80",
        translations: { es: { title: "Ceremonia del Té" }, en: { title: "Tea Ceremony" }, ca: { title: "Cerimònia del Té" } }
    }
];
