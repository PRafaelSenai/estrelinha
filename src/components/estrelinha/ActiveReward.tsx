import { useState, useEffect, useRef } from 'react';
import { Reward } from '@/hooks/useAppData';

interface Props {
    reward: Reward;
    onFinish: () => void;
    soundEnabled: boolean;
}

function formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

export default function ActiveReward({ reward, onFinish, soundEnabled }: Props) {
    // If no duration, just show a "Enjoy!" screen without timer, or default to something?
    // User asked for timer. If 0 duration, maybe just a manual "Done" button.
    const hasTimer = (reward.duration || 0) > 0;

    const [endTime, setEndTime] = useState<number>(() => {
        if (!hasTimer) return 0;
        const saved = localStorage.getItem(`reward_timer_${reward.id}`);
        if (saved) return parseInt(saved);
        const newEndTime = Date.now() + (reward.duration || 0) * 60 * 1000;
        localStorage.setItem(`reward_timer_${reward.id}`, newEndTime.toString());
        return newEndTime;
    });

    const [timeLeft, setTimeLeft] = useState<number>(() => {
        if (!hasTimer) return 0;
        return Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    });

    const [isPaused, setIsPaused] = useState(false);
    const [pausedTimeLeft, setPausedTimeLeft] = useState<number | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        return () => audioCtxRef.current?.close();
    }, []);

    const playSound = (type: string) => {
        if (!soundEnabled || !audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        // Simple pleasant chime for reward end
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        const now = ctx.currentTime;

        if (type === 'alarm') {
            // Happy chime for reward finish
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.2); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.4); // G5
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            osc.start(now);
            osc.stop(now + 0.8);
        }
    };

    useEffect(() => {
        if (!hasTimer || isPaused) return;

        const updateTimer = () => {
            const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
            setTimeLeft(remaining);

            if (remaining === 0) {
                playSound('alarm');
                localStorage.removeItem(`reward_timer_${reward.id}`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        const handleVisibility = () => {
            if (!document.hidden) updateTimer();
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [endTime, isPaused, hasTimer, reward.id]);

    const togglePause = () => {
        if (isPaused) {
            const newEndTime = Date.now() + (pausedTimeLeft || 0) * 1000;
            setEndTime(newEndTime);
            localStorage.setItem(`reward_timer_${reward.id}`, newEndTime.toString());
            setPausedTimeLeft(null);
        } else {
            setPausedTimeLeft(timeLeft);
        }
        setIsPaused(!isPaused);
    };

    const handleFinish = () => {
        localStorage.removeItem(`reward_timer_${reward.id}`);
        onFinish();
    };

    const totalSeconds = (reward.duration || 0) * 60;
    const percentage = hasTimer ? 100 - ((timeLeft / totalSeconds) * 100) : 100;

    return (
        <div className="flex flex-col h-full bg-indigo-900 text-white p-6 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                <i className="fa-solid fa-star absolute top-10 left-10 text-4xl animate-pulse"></i>
                <i className="fa-solid fa-star absolute bottom-20 right-10 text-6xl animate-pulse delay-700"></i>
                <i className="fa-solid fa-cloud absolute top-40 right-20 text-8xl opacity-50"></i>
            </div>

            <div className="z-10 flex flex-col items-center justify-center h-full">
                <div className="mb-8 relative">
                    <div className="w-40 h-40 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md animate-bounce">
                        <i className={`fa-solid ${reward.icon} text-6xl text-yellow-300 drop-shadow-md`}></i>
                    </div>
                    <i className="fa-solid fa-sparkles text-yellow-400 text-4xl absolute -top-2 -right-2 animate-spin-slow"></i>
                </div>

                <h2 className="text-3xl font-bold mb-2 text-center">{reward.title}</h2>
                <p className="text-indigo-200 mb-8 font-medium">Aproveite sua recompensa!</p>

                {hasTimer ? (
                    <>
                        <div className={`text-7xl font-mono font-bold mb-8 tabular-nums tracking-tighter ${timeLeft <= 10 && timeLeft > 0 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                            {formatTime(isPaused ? (pausedTimeLeft || 0) : timeLeft)}
                        </div>

                        <div className="w-full h-8 bg-black/30 rounded-full overflow-hidden mb-12 border border-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-linear relative"
                                style={{ width: `${(timeLeft / totalSeconds) * 100}%` }}
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50"></div>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            {timeLeft > 0 && (
                                <button
                                    onClick={togglePause}
                                    className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition active:scale-95 border border-white/20"
                                >
                                    <i className={`fa-solid ${isPaused ? 'fa-play' : 'fa-pause'} text-2xl`}></i>
                                </button>
                            )}
                            <button
                                onClick={handleFinish}
                                className="px-8 h-16 bg-white text-indigo-900 rounded-full font-bold text-xl hover:bg-indigo-50 transition shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                {timeLeft > 0 ? 'Parar' : 'Terminar'} <i className="fa-solid fa-check"></i>
                            </button>
                        </div>
                    </>
                ) : (
                    <button
                        onClick={handleFinish}
                        className="px-10 py-4 bg-white text-indigo-900 rounded-full font-bold text-xl hover:bg-indigo-50 transition shadow-lg active:scale-95 flex items-center gap-2"
                    >
                        Já Aproveitei! <i className="fa-solid fa-check"></i>
                    </button>
                )}
            </div>
        </div>
    );
}
