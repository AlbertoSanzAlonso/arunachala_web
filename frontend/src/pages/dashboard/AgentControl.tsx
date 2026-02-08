import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import { Cog6ToothIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const AgentControl: React.FC = () => {
    const navigate = useNavigate();
    const [tone, setTone] = useState("Asistente Amable");
    const [responseLength, setResponseLength] = useState("balanced");
    const [emojiStyle, setEmojiStyle] = useState("moderate");
    const [focusAreas, setFocusAreas] = useState<string[]>(["info"]); // Changed to array
    const [customFocus, setCustomFocus] = useState("");
    const [instructions, setInstructions] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1: Select Type, 2: Final Warning
    const [resetScope, setResetScope] = useState<string | null>(null);
    const [resetLoading, setResetLoading] = useState(false);
    const [showTriggerModal, setShowTriggerModal] = useState(false);

    // RAG Status State
    const [ragStatus, setRagStatus] = useState<any>(null);
    const [syncLoading, setSyncLoading] = useState<string | null>(null); // null, 'all', 'yoga', etc.
    const [lastSyncTime, setLastSyncTime] = useState<number>(0);
    const [suppressPolling, setSuppressPolling] = useState(false);

    // Automation Tasks State
    const [tasks, setTasks] = useState<any[]>([]);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [triggerLoading, setTriggerLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchConfig();
        fetchRagStatus();
        fetchTasks();
    }, []);

    // AUTO-POLLING LOGIC for real-time updates
    useEffect(() => {
        let interval: any = null;

        if (suppressPolling) return;

        const now = Date.now();
        const recentlyTriggered = now - lastSyncTime < 30000; // 30 seconds buffer
        const isProcessing = ragStatus && ragStatus.processing_count > 0;

        // Poll if we are explicitly loading, processing, or recently triggered sync
        const shouldPoll = syncLoading !== null || isProcessing || recentlyTriggered;

        if (shouldPoll) {
            interval = setInterval(() => {
                fetchRagStatus();
            }, 3000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [syncLoading, ragStatus?.processing_count, suppressPolling, lastSyncTime]);

    // Extra refresh when sync finishes
    useEffect(() => {
        if (ragStatus && ragStatus.processing_count === 0 && syncLoading === null) {
            const timeout = setTimeout(() => {
                fetchRagStatus();
            }, 2000);
            return () => clearTimeout(timeout);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ragStatus?.processing_count, syncLoading]);

    const fetchRagStatus = async () => {
        try {
            // Add timestamp to prevent browser caching
            const response = await fetch(`${API_BASE_URL}/api/rag/sync-status?t=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                setRagStatus(data);
            }
        } catch (error) {
            console.error("Failed to fetch RAG status", error);
        }
    };

    const handleSync = async (type: string, force: boolean = false) => {
        setSyncLoading(type);
        try {
            const response = await fetch(`${API_BASE_URL}/api/rag/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sync_type: type, force })
            });

            if (response.ok) {
                await response.json();
                const friendlyType: Record<string, string> = {
                    'all': 'todo el contenido',
                    'yoga': 'las clases de yoga',
                    'massage': 'los masajes',
                    'therapy': 'las terapias',
                    'article': 'los artículos del blog',
                    'meditation': 'las meditaciones guiadas',
                    'activity': 'las actividades'
                };

                setMessage(`¡Hecho! Se está actualizando la memoria con ${friendlyType[type] || 'el contenido'}. El progreso aparecerá abajo.`);
                setLastSyncTime(Date.now());
                // Refresh immediately
                fetchRagStatus();
            } else {
                setMessage("Hubo un problema al intentar actualizar la memoria.");
            }
        } catch (error) {
            setMessage("Error de conexión. Por favor, inténtalo de nuevo.");
        } finally {
            setSyncLoading(null);
        }
    };

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
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                setMessage("Error al guardar la configuración.");
            }
        } catch (error) {
            setMessage("Error de conexión al guardar.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetMemory = async () => {
        if (!resetScope) return;
        setResetLoading(true);
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/rag/chat-memory-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ scope: resetScope })
            });

            if (response.ok) {
                const successMessages: Record<string, string> = {
                    'all': '¡Borrado total completado! La IA ha olvidado todo y ahora es una hoja en blanco.',
                    'yoga_class': 'Hecho. La IA ya no recuerda nada sobre las clases de yoga.',
                    'massage': 'Se ha limpiado el conocimiento sobre los masajes.',
                    'therapy': 'La IA ha olvidado todo lo relacionado con las terapias.',
                    'article': 'He borrado los artículos del blog de la memoria de la IA.',
                    'meditation': 'Se han eliminado las meditaciones del conocimiento de la IA.',
                    'activity': 'Se han eliminado las actividades del conocimiento de la IA.'
                };

                setMessage(successMessages[resetScope] || 'La memoria ha sido reiniciada correctamente.');
                setShowResetModal(false);
                setResetStep(1);

                // OPTIMISTIC UPDATE: Set relevant vectorized count to 0 immediately
                if (ragStatus) {
                    const newStatus = { ...ragStatus };
                    newStatus.processing_count = 0;

                    // SUPPRESS POLLING for 5 seconds to let DB stabilize
                    setSuppressPolling(true);
                    setTimeout(() => setSuppressPolling(false), 5000);

                    if (resetScope === 'all') {
                        Object.keys(newStatus).forEach(key => {
                            if (newStatus[key] && typeof newStatus[key] === 'object' && newStatus[key].total !== undefined) {
                                newStatus[key].vectorized = 0;
                                newStatus[key].sync_percentage = 0;
                                newStatus[key].needs_reindex = newStatus[key].total;
                            }
                        });
                        newStatus.total_needs_reindex = Object.keys(newStatus)
                            .filter(k => typeof newStatus[k] === 'object' && newStatus[k].total !== undefined)
                            .reduce((sum, k) => (sum as number) + (newStatus[k].total as number), 0);
                    } else {
                        const tableMap: Record<string, string> = {
                            'yoga_class': 'yoga_classes',
                            'massage': 'massage_types',
                            'therapy': 'therapy_types',
                            'article': 'articles',
                            'meditation': 'meditations',
                            'activity': 'activities'
                        };
                        const targetKey = tableMap[resetScope];
                        if (targetKey && newStatus[targetKey]) {
                            newStatus[targetKey].vectorized = 0;
                            newStatus[targetKey].sync_percentage = 0;
                            newStatus[targetKey].needs_reindex = newStatus[targetKey].total;
                            // Recalculate total needs reindex
                            newStatus.total_needs_reindex = Object.keys(newStatus)
                                .filter(k => typeof newStatus[k] === 'object' && newStatus[k].total !== undefined)
                                .reduce((sum, k) => (sum as number) + (newStatus[k].needs_reindex !== undefined ? newStatus[k].needs_reindex : (newStatus[k].total || 0)), 0);
                        }
                    }
                    setRagStatus(newStatus);
                }

                // Still fetch to be safe after a short delay
                setTimeout(fetchRagStatus, 4000);
            } else {
                setMessage("No se pudo completar el reinicio de memoria.");
            }
        } catch (error) {
            setMessage("Error de conexión al reiniciar.");
        } finally {
            setResetLoading(false);
        }
    };

    const fetchTasks = async () => {
        setTasksLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/automation/tasks`);
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            }
        } catch (error) {
            console.error("Failed to fetch automation tasks", error);
        } finally {
            setTasksLoading(false);
        }
    };

    const handleTriggerTask = async (taskType: string, category?: string) => {
        const triggerKey = `${taskType}-${category || 'all'}`;
        setTriggerLoading(triggerKey);
        try {
            const token = sessionStorage.getItem('access_token');
            console.log("Triggering task with token type:", typeof token, "exists:", !!token);

            if (!token) {
                setMessage("Error: No se encontró el token de sesión. Por favor, vuelve a iniciar sesión.");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/automation/trigger`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ task_type: taskType, category })
            });

            if (response.status === 401) {
                setMessage("Tu sesión ha expirado o es inválida. Por favor, reinicia sesión.");
                return;
            }

            if (response.ok) {
                setShowTriggerModal(true);
            } else {
                setMessage("Error al disparar la tarea automática.");
            }
        } catch (error) {
            setMessage("Error de conexión al disparar la tarea.");
        } finally {
            setTriggerLoading(null);
        }
    };

    const handleUpdateTaskSchedule = async (task: any, updates: any) => {
        try {
            const token = sessionStorage.getItem('access_token');
            if (!token) {
                setMessage("Sesión no encontrada. Por favor, reinicia sesión.");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/automation/tasks/${task.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...task, ...updates })
            });

            if (response.status === 401) {
                setMessage("Sesión expirada. Por favor, reinicia sesión.");
                return;
            }

            if (response.ok) {
                const updatedTask = await response.json();
                setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
                setMessage(`Horario actualizado para: ${task.name}`);
            }
        } catch (error) {
            console.error("Failed to update task schedule", error);
            setMessage("Error al actualizar el horario.");
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
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => setShowResetModal(true)}
                        className="px-6 py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-all"
                    >
                        Reiniciar Memoria de la IA
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-forest text-white font-medium rounded-xl hover:bg-matcha hover:scale-105 transition-all shadow-md disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                </div>

            </form>

            {/* ARTICULOS Y AUTOMATIZACIÓN (NEW SECTION) */}
            <div className="mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-matcha/20 p-2 rounded-lg">
                        <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 2v6h6" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 13H8m8 4H8m0-8h1" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-headers text-bark">Generación de Contenido</h2>
                        <p className="text-gray-500 text-sm">Dispara la creación de nuevos artículos para el blog.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Yoga Trigger */}
                    <div className="p-6 rounded-2xl bg-forest/5 border border-forest/10 flex items-center justify-between">
                        <div>
                            <span className="block font-bold text-forest mb-1">Artículo de Yoga</span>
                            <p className="text-xs text-forest/70 max-w-[200px]">Crea un artículo sobre beneficios, posturas o filosofía.</p>
                        </div>
                        <button
                            onClick={() => handleTriggerTask('generate_article', 'yoga')}
                            disabled={triggerLoading === 'generate_article-yoga'}
                            className="px-4 py-2 bg-forest text-white text-sm font-bold rounded-xl hover:bg-matcha transition-all shadow-sm disabled:opacity-50"
                        >
                            {triggerLoading === 'generate_article-yoga' ? 'Generando...' : 'Generar Ahora'}
                        </button>
                    </div>

                    {/* Therapy Trigger */}
                    <div className="p-6 rounded-2xl bg-bark/5 border border-bark/10 flex items-center justify-between">
                        <div>
                            <span className="block font-bold text-bark mb-1">Artículo de Terapias</span>
                            <p className="text-xs text-bark/70 max-w-[200px]">Genera contenido sobre masajes y terapias alternativas.</p>
                        </div>
                        <button
                            onClick={() => handleTriggerTask('generate_article', 'therapy')}
                            disabled={triggerLoading === 'generate_article-therapy'}
                            className="px-4 py-2 bg-bark text-white text-sm font-bold rounded-xl hover:bg-bark/80 transition-all shadow-sm disabled:opacity-50"
                        >
                            {triggerLoading === 'generate_article-therapy' ? 'Generando...' : 'Generar Ahora'}
                        </button>
                    </div>
                </div>

                {/* Automation Scheduling */}
                <div className="border-t border-gray-100 pt-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Programación Automática</h3>
                        <span className="text-[10px] bg-matcha/10 text-forest px-2 py-1 rounded-full font-bold">RETIROS Y BLOG</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {tasks.map((task) => (
                            <div key={task.id} className="group relative flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 hover:border-matcha/30 hover:shadow-md transition-all gap-6">
                                {/* Left side: Info */}
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${task.is_active ? 'bg-forest text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className={`block font-bold text-bark transition-colors ${task.is_active ? 'text-forest' : ''}`}>{task.name}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`inline-block w-2 h-2 rounded-full ${task.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                                            <span className="text-[11px] text-gray-500 font-medium">
                                                {task.last_run
                                                    ? `Última: ${new Date(task.last_run).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`
                                                    : (task.is_active ? 'Activa' : 'Inactiva')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right side: Controls */}
                                <div className="flex flex-wrap items-center gap-6">
                                    {/* Day Picker */}
                                    <div className="space-y-2">
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase ml-1">Días de ejecución</span>
                                        <div className="flex gap-1.5 p-1.5 bg-gray-50 rounded-xl border border-gray-100">
                                            {['1', '2', '3', '4', '5', '6', '0'].map((d) => {
                                                const dayLabel = ['D', 'L', 'M', 'X', 'J', 'V', 'S'][parseInt(d)];
                                                const isActive = task.schedule_days?.split(',').includes(d);
                                                return (
                                                    <button
                                                        key={d}
                                                        onClick={() => {
                                                            let days = task.schedule_days?.split(',').filter((x: string) => x) || [];
                                                            if (days.includes(d)) days = days.filter((x: string) => x !== d);
                                                            else days.push(d);
                                                            handleUpdateTaskSchedule(task, { schedule_days: days.join(',') });
                                                        }}
                                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all transform active:scale-90 ${isActive
                                                            ? 'bg-forest text-white shadow-sm'
                                                            : 'bg-white text-gray-400 hover:text-bark hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {dayLabel}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Time Picker */}
                                    <div className="space-y-2">
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase ml-1">Hora</span>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={task.schedule_time}
                                                onChange={(e) => handleUpdateTaskSchedule(task, { schedule_time: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-bark focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {/* Toggle */}
                                    <div className="flex flex-col items-center gap-1">
                                        <span className={`text-[10px] font-bold uppercase transition-colors ${task.is_active ? 'text-forest' : 'text-gray-400'}`}>
                                            {task.is_active ? 'Activa' : 'Pausada'}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-[1px] bg-gray-100 hidden md:block" />
                                            <button
                                                onClick={() => handleUpdateTaskSchedule(task, { is_active: !task.is_active })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-forest/20 focus:ring-offset-2 ${task.is_active ? 'bg-forest shadow-sm' : 'bg-gray-200'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${task.is_active ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* KNOWLEDGE CENTER */}
            <div className="mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-xl font-headers text-bark">Centro de Conocimiento</h2>
                            <p className="text-gray-500 text-sm">Gestiona la sincronización entre la base de datos y la memoria de la IA.</p>
                        </div>
                        {(ragStatus?.processing_count > 0 || syncLoading !== null || (Date.now() - lastSyncTime < 30000)) && (
                            <div className="flex items-center gap-2 bg-matcha/10 px-3 py-1 rounded-full border border-matcha/20 animate-pulse">
                                <div className="w-2 h-2 bg-matcha rounded-full animate-bounce" />
                                <span className="text-[10px] font-bold text-forest uppercase tracking-wider">Actualizando...</span>
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setRagStatus(null);
                            fetchRagStatus();
                        }}
                        className="p-2 text-gray-400 hover:text-forest transition-colors"
                        title="Actualizar estado"
                    >
                        <svg className={`w-5 h-5 ${syncLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>

                {ragStatus ? (
                    <div className="space-y-6">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[
                                { id: 'yoga', label: 'Yoga', data: ragStatus.yoga_classes, color: 'matcha' },
                                { id: 'massage', label: 'Masajes', data: ragStatus.massage_types, color: 'matcha' },
                                { id: 'therapy', label: 'Terapias', data: ragStatus.therapy_types, color: 'matcha' },
                                { id: 'article', label: 'Blog', data: ragStatus.articles, color: 'matcha' },
                                { id: 'meditation', label: 'Meditaciones', data: ragStatus.meditations, color: 'matcha' },
                                { id: 'activity', label: 'Actividades', data: ragStatus.activities, color: 'matcha' },
                            ].map((item) => item.data && (
                                <div key={item.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                    <span className="block text-xs font-bold text-gray-400 uppercase mb-1">{item.label}</span>
                                    <div className="flex items-end justify-between">
                                        <span className="text-2xl font-bold text-bark">{item.data.vectorized}</span>
                                        <span className="text-xs text-gray-400">/ {item.data.total}</span>
                                    </div>
                                    <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-${item.color} transition-all duration-1000`}
                                            style={{ width: `${item.data.sync_percentage}%` }}
                                        />
                                    </div>
                                    {item.data.needs_reindex > 0 && (
                                        <button
                                            onClick={() => handleSync(item.id)}
                                            disabled={syncLoading !== null}
                                            className="mt-3 w-full py-1 text-[10px] font-bold bg-white border border-gray-200 rounded hover:border-forest hover:text-forest transition-all disabled:opacity-50"
                                        >
                                            {syncLoading === item.id ? 'Sincronizando...' : `Sincronizar ${item.data.needs_reindex}`}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Control Actions */}
                        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                            <button
                                onClick={() => handleSync('all')}
                                disabled={syncLoading !== null}
                                className="px-6 py-2 bg-bark text-white rounded-xl text-sm font-medium hover:bg-bark/90 transition-all shadow-sm disabled:opacity-50"
                            >
                                {syncLoading === 'all' ? 'Procesando...' : 'Sincronizar Todo lo Pendiente'}
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm("¿Estás seguro? Esto enviará TODA la base de datos a n8n de nuevo.")) {
                                        handleSync('all', true);
                                    }
                                }}
                                disabled={syncLoading !== null}
                                className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
                            >
                                Forzar Reindexación Completa
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-gray-400 italic">
                        Cargando estado de sincronización...
                    </div>
                )}

                {/* Automation Trigger Success Modal */}
                {showTriggerModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bark/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-forest/10 text-center"
                        >
                            <div className="w-20 h-20 bg-matcha/20 text-forest rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-headers text-bark mb-4">Petición Procesada</h2>

                            <div className="space-y-4 text-gray-600 mb-8">
                                <p>
                                    La orden de generación de artículo ha sido enviada con éxito a nuestro agente de IA.
                                </p>
                                <div className="bg-gray-50 p-4 rounded-xl text-sm italic">
                                    "La IA está ahora mismo investigando, redactando y seleccionando imágenes para tu nuevo contenido."
                                </div>
                                <p className="text-sm">
                                    Este proceso suele tardar <strong className="text-bark">entre 2 y 5 minutos</strong>. Puedes seguir trabajando en el dashboard; el artículo aparecerá automáticamente en la sección de <strong className="text-bark">Contenidos</strong> cuando esté listo.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowTriggerModal(false)}
                                className="w-full py-4 bg-forest text-white rounded-xl font-bold hover:bg-matcha transition-all shadow-lg active:scale-95"
                            >
                                Entendido, volveré luego
                            </button>

                            <button
                                onClick={() => navigate('/dashboard/content')}
                                className="mt-4 w-full text-forest text-sm font-medium hover:underline"
                            >
                                Ir a la sección de contenidos
                            </button>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Panic Reset Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bark/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-red-100"
                    >
                        {resetStep === 1 ? (
                            <>
                                <h2 className="text-2xl font-headers text-red-600 mb-4">Reiniciar Memoria de IA</h2>
                                <p className="text-gray-600 mb-6">Esta acción eliminará segmentos del conocimiento de la IA. ¿Qué parte quieres borrar?</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                                    {[
                                        { id: 'all', label: 'TODO (Reset Total)', color: 'bg-red-600' },
                                        { id: 'yoga_class', label: 'Clases de Yoga', color: 'bg-forest' },
                                        { id: 'massage', label: 'Masajes', color: 'bg-matcha' },
                                        { id: 'therapy', label: 'Terapias', color: 'bg-matcha' },
                                        { id: 'article', label: 'Blog/Artículos', color: 'bg-bark' },
                                        { id: 'meditation', label: 'Meditaciones', color: 'bg-matcha' },
                                        { id: 'activity', label: 'Actividades', color: 'bg-blue-600' },
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setResetScope(cat.id); setResetStep(2); }}
                                            className={`p-4 rounded-xl text-white font-medium text-sm transition-transform hover:scale-105 ${cat.color}`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowResetModal(false)}
                                    className="w-full text-gray-400 text-sm hover:underline"
                                >
                                    Cancelar
                                </button>
                            </>
                        ) : (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-headers text-bark mb-4">¿Estás Complemente Seguro?</h2>
                                <div className="bg-red-50 p-4 rounded-xl mb-6 text-left">
                                    <ul className="text-sm text-red-700 space-y-2">
                                        <li>• La IA olvidará esta información de inmediato.</li>
                                        <li>• No podrás recuperar los datos vectoriales.</li>
                                        <li>• Tendrás que volver a guardar los elementos en el dashboard para que la IA los vuelva a aprender.</li>
                                    </ul>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleResetMemory}
                                        disabled={resetLoading}
                                        className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg"
                                    >
                                        {resetLoading ? 'Procesando...' : 'SÍ, BORRAR DEFINITIVAMENTE'}
                                    </button>
                                    <button
                                        onClick={() => setResetStep(1)}
                                        className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all"
                                    >
                                        Volver atrás
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AgentControl;
