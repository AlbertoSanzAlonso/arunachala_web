import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { Cog6ToothIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const AgentControl: React.FC = () => {
    const [tone, setTone] = useState("Asistente Amable");
    const [responseLength, setResponseLength] = useState("balanced");
    const [emojiStyle, setEmojiStyle] = useState("moderate");
    const [focusAreas, setFocusAreas] = useState<string[]>(["info"]); // Changed to array
    const [customFocus, setCustomFocus] = useState("");
    const [instructions, setInstructions] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/config`);
            if (response.ok) {
                const data = await response.json();
                setTone(data.tone || "Asistente Amable");
                setResponseLength(data.response_length || "balanced");
                setEmojiStyle(data.emoji_style || "moderate");

                // Parse focus area string to list
                const rawFocus = data.focus_area || "info";
                const parsedFocus = rawFocus.split(',');

                // Separate standard options from custom
                const standards = ['info', 'booking', 'coaching'];
                const standardSelected = parsedFocus.filter((f: string) => standards.includes(f));
                const customSelected = parsedFocus.filter((f: string) => !standards.includes(f));

                setFocusAreas(standardSelected);
                if (customSelected.length > 0) {
                    setCustomFocus(customSelected[0]); // Assume one custom focus for now
                }

                setInstructions(data.system_instructions || "");
                setIsActive(data.is_active ?? true);
            }
        } catch (error) {
            console.error("Failed to fetch agent config", error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Validation: Must have at least one focus (either standard or custom)
        if (focusAreas.length === 0 && !customFocus.trim()) {
            setMessage("Error: Debe elegir al menos un enfoque principal o escribir uno en 'Otro'.");
            setLoading(false);
            return;
        }

        // Combine standard and custom
        let finalFocus = [...focusAreas];
        if (customFocus.trim()) {
            finalFocus.push(customFocus.trim());
        }
        const focusString = finalFocus.join(',');

        try {
            const response = await fetch(`${API_BASE_URL}/api/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tone,
                    response_length: responseLength,
                    emoji_style: emojiStyle,
                    focus_area: focusString,
                    system_instructions: instructions,
                    is_active: isActive
                })
            });

            if (response.ok) {
                setMessage("Configuración guardada correctamente. El agente actualizará su comportamiento de inmediato.");
            } else {
                setMessage("Error al guardar la configuración.");
            }
        } catch (error) {
            setMessage("Error de conexión al guardar.");
        } finally {
            setLoading(false);
        }
    };

    const OptionGroup = ({ label, options, value, onChange }: any) => (
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex flex-wrap gap-2">
                {options.map((opt: any) => (
                    <button
                        key={opt.val}
                        type="button"
                        onClick={() => onChange(opt.val)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${value === opt.val
                            ? 'bg-forest text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );

    const MultiSelectOptionGroup = () => {
        const toggleOption = (val: string) => {
            if (focusAreas.includes(val)) {
                // Allow deselecting IF there are more items OR custom text exists
                if (focusAreas.length > 1 || customFocus.trim().length > 0) {
                    setFocusAreas(focusAreas.filter(f => f !== val));
                }
            } else {
                setFocusAreas([...focusAreas, val]);
            }
        };

        const options = [
            { val: 'info', label: 'Informativo (Resolver dudas)' },
            { val: 'booking', label: 'Comercial (Cerrar reservas)' },
            { val: 'coaching', label: 'Motivacional (Bienestar)' }
        ];

        return (
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Enfoque Principal (Selección Múltiple)</label>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                        {options.map((opt) => (
                            <button
                                key={opt.val}
                                type="button"
                                onClick={() => toggleOption(opt.val)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${focusAreas.includes(opt.val)
                                    ? 'bg-forest text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    {/* Custom Option */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-500">Otro:</span>
                        <input
                            type="text"
                            value={customFocus}
                            onChange={(e) => setCustomFocus(e.target.value)}
                            placeholder="Ej: Dar soporte técnico..."
                            className="flex-1 p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-forest bg-gray-50 focus:bg-white transition-all"
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-forest/10 p-3 rounded-full">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-forest" />
                </div>
                <div>
                    <h1 className="text-2xl font-headers text-bark">Control del Agente IA</h1>
                    <p className="text-gray-500 text-sm">Personaliza el comportamiento y la personalidad de tu asistente virtual.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">

                {/* Tone Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tono y Personalidad</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['Asistente Amable', 'Muy Formal', 'Espiritual y Zen', 'Enérgico y Motivador'].map((option) => (
                            <button
                                type="button"
                                key={option}
                                onClick={() => setTone(option)}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${tone === option
                                    ? 'border-forest bg-forest/5 text-forest'
                                    : 'border-gray-100 hover:border-forest/30 text-gray-600'
                                    }`}
                            >
                                <span className="block font-medium">{option}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* NEW FIELDS */}
                    <div>
                        <OptionGroup
                            label="Longitud de Respuesta"
                            value={responseLength}
                            onChange={setResponseLength}
                            options={[
                                { val: 'concise', label: 'Breve y Directa' },
                                { val: 'balanced', label: 'Equilibrada' },
                                { val: 'detailed', label: 'Explicativa y Detallada' }
                            ]}
                        />
                        <OptionGroup
                            label="Uso de Emojis"
                            value={emojiStyle}
                            onChange={setEmojiStyle}
                            options={[
                                { val: 'none', label: 'Sin Emojis' },
                                { val: 'moderate', label: 'Moderado (Cálido)' },
                                { val: 'high', label: 'Divertido (Frecuente)' }
                            ]}
                        />
                    </div>
                    <div>
                        <MultiSelectOptionGroup />
                    </div>
                </div>

                {/* System Instructions */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instrucciones Específicas</label>
                    <textarea
                        rows={4}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Ej: Recuerda mencionar que hay descuento para estudiantes. No des diagnósticos médicos."
                        className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
                    />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <Cog6ToothIcon className="w-6 h-6 text-gray-400" />
                    <div className="flex-1">
                        <span className="block text-sm font-medium text-gray-700">Estado del Agente</span>
                        <span className="text-xs text-gray-500">Activa o desactiva las respuestas automáticas.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-forest/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest"></div>
                    </label>
                </div>

                {/* Feedback Message */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}
                    >
                        {message}
                    </motion.div>
                )}

                {/* Submit */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-forest text-white font-medium rounded-xl hover:bg-matcha hover:scale-105 transition-all shadow-md disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default AgentControl;
