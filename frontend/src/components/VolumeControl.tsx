import React, { useState, useEffect } from 'react';
import { SpeakerXMarkIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';

interface VolumeControlProps {
    volume: number;
    isMuted: boolean;
    onVolumeChange: (val: number) => void;
    onMuteToggle: () => void;
    size?: 'sm' | 'md';
}

const VolumeControl: React.FC<VolumeControlProps> = ({ volume, isMuted, onVolumeChange, onMuteToggle, size = 'md' }) => {
    const isSmall = size === 'sm';
    const [timerActive, setTimerActive] = useState(false);

    useEffect(() => {
        let timer: any;
        if (timerActive) {
            timer = setTimeout(() => {
                setTimerActive(false);
            }, 2000);
        }
        return () => clearTimeout(timer);
    }, [timerActive]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onMuteToggle();
        // If we unmute, show the bar for 2 seconds so user can adjust
        if (isMuted) {
            setTimerActive(true);
        }
    };

    const isVisible = timerActive;

    return (
        <div className={`flex items-center group/volume ${isSmall ? 'gap-1 p-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm' : 'gap-3'}`}>
            <button
                onClick={handleToggle}
                className="text-forest hover:text-matcha transition-colors outline-none"
                aria-label={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted || volume === 0 ? (
                    <SpeakerXMarkIcon className={isSmall ? "w-5 h-5" : "w-8 h-8"} />
                ) : (
                    <SpeakerWaveIcon className={isSmall ? "w-5 h-5" : "w-8 h-8"} />
                )}
            </button>
            <div className={`overflow-hidden transition-all duration-300 flex items-center ${isVisible
                    ? (isSmall ? 'w-20 pr-1' : 'w-24 opacity-100')
                    : (isSmall ? 'w-0 group-hover/volume:w-20 pr-1' : 'w-0 group-hover/volume:w-24 opacity-0 group-hover/volume:opacity-100')
                }`}>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                        e.stopPropagation();
                        onVolumeChange(parseFloat(e.target.value));
                        // Keep visible while interacting
                        setTimerActive(true);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`accent-forest cursor-pointer appearance-none bg-forest/20 rounded-full ${isSmall ? 'h-1 w-full' : 'h-1.5 w-full'}`}
                />
            </div>
        </div>
    );
};

export default VolumeControl;
