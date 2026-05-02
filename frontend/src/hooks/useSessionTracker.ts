import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';

const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
const WARNING_DURATION = 2 * 60 * 1000;  // 2 minutes
const IDLE_BEFORE_WARNING = SESSION_DURATION - WARNING_DURATION;

export const useSessionTracker = () => {
    const {
        isAuthenticated,
        showSessionWarning,
        setShowSessionWarning,
        setRemainingTime,
        logout
    } = useAuthStore();

    const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const startWarning = useCallback(() => {
        setShowSessionWarning(true);
        setRemainingTime(WARNING_DURATION / 1000);
    }, [setShowSessionWarning, setRemainingTime]);

    const resetIdleTimer = useCallback(() => {
        if (showSessionWarning) return;

        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
        }

        warningTimeoutRef.current = setTimeout(startWarning, IDLE_BEFORE_WARNING);
    }, [showSessionWarning, startWarning]);

    // Throttle helper
    const lastResetRef = useRef(0);
    const throttledReset = useCallback(() => {
        const now = Date.now();
        if (now - lastResetRef.current > 1000) { // Max once per second
            resetIdleTimer();
            lastResetRef.current = now;
        }
    }, [resetIdleTimer]);

    // Setup activity listeners
    useEffect(() => {
        if (!isAuthenticated || showSessionWarning) return;

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

        resetIdleTimer();
        events.forEach(event => window.addEventListener(event, throttledReset));

        return () => {
            events.forEach(event => window.removeEventListener(event, throttledReset));
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        };
    }, [isAuthenticated, showSessionWarning, throttledReset, resetIdleTimer]);

    // Countdown logic
    useEffect(() => {
        if (!isAuthenticated || !showSessionWarning) {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
            return;
        }

        countdownIntervalRef.current = setInterval(() => {
            useAuthStore.getState().setRemainingTime(useAuthStore.getState().remainingTime - 1);

            if (useAuthStore.getState().remainingTime <= 0) {
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                logout("Tu sesión ha expirado por inactividad.");
            }
        }, 1000);

        return () => {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, [isAuthenticated, showSessionWarning, logout]);
};
