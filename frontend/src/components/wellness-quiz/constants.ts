import { TreeNode } from './types';

export const QUIZ_TREE: Record<string, TreeNode> = {
    'root': {
        id: 'root',
        questionKey: 'home.quiz.l1.question',
        options: [
            { id: 'A', textKey: 'home.quiz.l1.options.A', next: 'L2-A' },
            { id: 'B', textKey: 'home.quiz.l1.options.B', next: 'L2-B' },
            { id: 'C', textKey: 'home.quiz.l1.options.C', next: 'L2-C' }
        ]
    },
    'L2-A': {
        id: 'L2-A',
        questionKey: 'home.quiz.l2.A.question',
        options: [
            { id: 'A1', textKey: 'home.quiz.l2.A.options.A1', next: 'L3-A1' },
            { id: 'A2', textKey: 'home.quiz.l2.A.options.A2', next: 'L3-A2' }
        ]
    },
    'L2-B': {
        id: 'L2-B',
        questionKey: 'home.quiz.l2.B.question',
        options: [
            { id: 'B1', textKey: 'home.quiz.l2.B.options.B1', next: 'L3-B1' },
            { id: 'B2', textKey: 'home.quiz.l2.B.options.B2', next: 'L3-B2' }
        ]
    },
    'L2-C': {
        id: 'L2-C',
        questionKey: 'home.quiz.l2.C.question',
        options: [
            { id: 'C1', textKey: 'home.quiz.l2.C.options.C1', next: 'L3-C1' },
            { id: 'C2', textKey: 'home.quiz.l2.C.options.C2', next: 'L3-C2' }
        ]
    },
    'L3-A1': {
        id: 'L3-A1',
        questionKey: 'home.quiz.l3.A1.question',
        options: [
            { id: 'A1-1', textKey: 'home.quiz.l3.A1.options.1', next: 'L4-FINAL' },
            { id: 'A1-2', textKey: 'home.quiz.l3.A1.options.2', next: 'L4-FINAL' }
        ]
    },
    'L3-A2': {
        id: 'L3-A2',
        questionKey: 'home.quiz.l3.A2.question',
        options: [
            { id: 'A2-1', textKey: 'home.quiz.l3.A2.options.1', next: 'L4-FINAL' },
            { id: 'A2-2', textKey: 'home.quiz.l3.A2.options.2', next: 'L4-FINAL' }
        ]
    },
    'L3-B1': {
        id: 'L3-B1',
        questionKey: 'home.quiz.l3.B1.question',
        options: [
            { id: 'B1-1', textKey: 'home.quiz.l3.B1.options.1', next: 'L4-FINAL' },
            { id: 'B1-2', textKey: 'home.quiz.l3.B1.options.2', next: 'L4-FINAL' }
        ]
    },
    'L3-B2': {
        id: 'L3-B2',
        questionKey: 'home.quiz.l3.B2.question',
        options: [
            { id: 'B2-1', textKey: 'home.quiz.l3.B2.options.1', next: 'L4-FINAL' },
            { id: 'B2-2', textKey: 'home.quiz.l3.B2.options.2', next: 'L4-FINAL' }
        ]
    },
    'L3-C1': {
        id: 'L3-C1',
        questionKey: 'home.quiz.l3.C1.question',
        options: [
            { id: 'C1-1', textKey: 'home.quiz.l3.C1.options.1', next: 'L4-FINAL' },
            { id: 'C1-2', textKey: 'home.quiz.l3.C1.options.2', next: 'L4-FINAL' }
        ]
    },
    'L3-C2': {
        id: 'L3-C2',
        questionKey: 'home.quiz.l3.C2.question',
        options: [
            { id: 'C2-1', textKey: 'home.quiz.l3.C2.options.1', next: 'L4-FINAL' },
            { id: 'C2-2', textKey: 'home.quiz.l3.C2.options.2', next: 'L4-FINAL' }
        ]
    },
    'L4-FINAL': {
        id: 'L4-FINAL',
        questionKey: 'home.quiz.l4.question',
        options: [
            { id: 'NO_EXTRA', textKey: 'home.quiz.l4.options.no' }
        ]
    }
};

export const PROMPT_LABELS = {
    es: {
        intro: 'Analiza mi camino de respuestas en el cuestionario "Un Momento para Escucharte":',
        instr: 'Genera mi hoja de ruta de bienestar personalizada en exactamente 4 bloques. Deriva hacia Terapias/Masajes si el malestar es físico/localizado, y hacia Yoga si el malestar es emocional/mental. USA EL FORMATO DE BOTONES: [[BUTTON:Saber más|/URL]]. PROHIBIDO poner ":" o "." tras los títulos en negrita.',
        h1: 'Sobre lo que nos has compartido',
        h2: 'Nuestra propuesta para ti',
        h3: 'Un recurso para profundizar',
        h4: 'Un pequeño apoyo para ahora',
        h1_desc: '(Análisis breve)',
        h2_desc: '(Menciona UNA actividad real: clase, masaje, terapia o actividad)',
        h3_desc: '(Menciona UN contenido real: artículo o meditación)',
        h4_desc: '(Consejo práctico inmediato)'
    },
    en: {
        intro: 'Analyze my answers path in the "A Moment to Listen to Yourself" quiz:',
        instr: 'Generate my personalized wellness roadmap in exactly 4 blocks. Lean towards Therapies/Massages if the discomfort is physical/localized/acute, and towards Yoga if it is emotional/mental/stress. USE BUTTON FORMAT: [[BUTTON:Learn more|/URL]]. FORBIDDEN to put ":" or "." after bold headers.',
        h1: 'About what you shared',
        h2: 'Our proposal for you',
        h3: 'A resource to deepen',
        h4: 'A little support for now',
        h1_desc: '(Brief analysis)',
        h2_desc: '(Mention ONE real activity: class, massage, therapy or activity)',
        h3_desc: '(Mention ONE real content: article or meditation)',
        h4_desc: '(Immediate practical advice)'
    },
    ca: {
        intro: 'Analitza el meu camí de respostes en el qüestionari "Un moment per Escoltar-te":',
        instr: 'Genera el meu full de ruta de benestar personalitzat en exactament 4 blocs. Deriva cap a Teràpies/Massatges si el malestar és físic/localitzat, i cap a Ioga si el malestar és emocional/mental. UTILITZA EL FORMAT DE BOTONS: [[BUTTON:Saber-ne més|/URL]]. PROHIBIT posar ":" o "." després dels títols en negreta.',
        h1: 'Sobre el que ens has compartit',
        h2: 'La nostra proposta per a tu',
        h3: 'Un recurs per aprofundir',
        h4: 'Un petit suport per ara',
        h1_desc: '(Anàlisi breu)',
        h2_desc: '(Esmenta UNA activitat real: classe, massatge, teràpia o activitat)',
        h3_desc: '(Esmenta UN contingut real: article o meditació)',
        h4_desc: '(Consell pràctic immediat)'
    }
};
