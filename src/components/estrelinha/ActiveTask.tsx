import { useState, useEffect, useRef } from 'react';
import { Task } from '@/hooks/useAppData';

interface Props {
  task: Task;
  onFinish: (success: boolean) => void;
  onBack: () => void;
  soundEnabled: boolean;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

export default function ActiveTask({ task, onFinish, onBack, soundEnabled }: Props) {
  const [endTime, setEndTime] = useState<number>(() => {
    // Check if there's a saved endTime for this task
    const saved = localStorage.getItem(`task_timer_${task.id}`);
    if (saved) {
      return parseInt(saved);
    }
    const newEndTime = Date.now() + task.duration * 60 * 1000;
    localStorage.setItem(`task_timer_${task.id}`, newEndTime.toString());
    return newEndTime;
  });
  
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    return Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  });
  
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTimeLeft, setPausedTimeLeft] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  const playSound = (type: string) => {
    if (!soundEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'tick') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'alarm') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  };

  // Timer using timestamps (works even when minimized/screen off)
  useEffect(() => {
    if (isPaused) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining <= 10 && remaining > 0) {
        playSound('tick');
      }
      
      if (remaining === 0) {
        playSound('alarm');
        localStorage.removeItem(`task_timer_${task.id}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    // Also update on visibility change (when user returns to app)
    const handleVisibility = () => {
      if (!document.hidden) {
        updateTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [endTime, isPaused, task.id]);

  const togglePause = () => {
    if (isPaused) {
      // Resume: set new end time based on remaining time
      const newEndTime = Date.now() + (pausedTimeLeft || 0) * 1000;
      setEndTime(newEndTime);
      localStorage.setItem(`task_timer_${task.id}`, newEndTime.toString());
      setPausedTimeLeft(null);
    } else {
      // Pause: save current remaining time
      setPausedTimeLeft(timeLeft);
    }
    setIsPaused(!isPaused);
  };

  const handleFinish = (success: boolean) => {
    localStorage.removeItem(`task_timer_${task.id}`);
    onFinish(success);
  };

  const totalSeconds = task.duration * 60;
  const percentage = (timeLeft / totalSeconds) * 100;
  const isFinished = timeLeft <= 0;
  const isCountdown = timeLeft <= 10 && timeLeft > 0;

  let progressColor = 'bg-green-500';
  if (percentage < 50) progressColor = 'bg-yellow-400';
  if (percentage < 20) progressColor = 'bg-red-500';

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-md"
        >
          <i className="fa-solid fa-chevron-down text-lg"></i>
        </button>
        <span className="text-white/60 font-medium tracking-widest text-sm uppercase">Em Atividade</span>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center z-10">
        <div className="relative mb-8">
          <div className="w-48 h-48 rounded-full flex items-center justify-center border-8 border-white/10 bg-white/5 relative z-10" style={{ animation: 'float 3s ease-in-out infinite' }}>
            <i className={`fa-solid ${task.icon} text-7xl text-white drop-shadow-lg`}></i>
          </div>
          {percentage < 20 && !isFinished && (
            <div className="absolute inset-0 bg-red-500 rounded-full opacity-30 animate-ping"></div>
          )}
        </div>

        <h2 className="text-3xl font-bold mb-2 text-center px-4">{task.title}</h2>

        <div
          className={`text-6xl font-mono font-bold mb-8 tabular-nums tracking-tighter transition-all duration-200 ${
            isCountdown ? 'text-red-400 scale-110' : 'text-white'
          }`}
          style={isCountdown ? { animation: 'heartbeat 1s infinite' } : undefined}
        >
          {formatTime(isPaused ? (pausedTimeLeft || 0) : timeLeft)}
        </div>

        {isCountdown && <div className="text-red-400 font-bold mb-4 animate-pulse">QUASE ACABANDO!</div>}

        <div className="w-full h-6 bg-black/30 rounded-full overflow-hidden mb-10 border border-white/10">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${progressColor}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        {!isFinished ? (
          <div className="flex flex-col gap-4 w-full px-8">
            <div className="flex justify-center gap-6">
              <button
                onClick={togglePause}
                className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition backdrop-blur-md border border-white/10 active:scale-95"
              >
                <i className={`fa-solid ${isPaused ? 'fa-play pl-1' : 'fa-pause'} text-2xl`}></i>
              </button>
              <button
                onClick={() => handleFinish(true)}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition shadow-lg shadow-green-500/40 transform hover:scale-110 active:scale-95"
              >
                <i className="fa-solid fa-check text-2xl"></i>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center w-full px-4">
            <p className="text-2xl mb-6 text-yellow-300 font-bold drop-shadow-md animate-bounce">Tempo Esgotado!</p>
            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={() => handleFinish(true)}
                className="w-full bg-yellow-400 text-slate-900 px-6 py-4 rounded-2xl font-bold text-xl shadow-xl hover:bg-yellow-300 transform transition hover:scale-105 active:scale-95 border-b-4 border-yellow-600"
              >
                Pegar Estrelinha <i className="fa-solid fa-star ml-2"></i>
              </button>
              <button
                onClick={() => handleFinish(false)}
                className="w-full bg-red-900/50 text-red-200 border border-red-500/30 px-6 py-3 rounded-xl font-medium text-sm hover:bg-red-900/80 transition"
              >
                Não realizei a tarefa (-1 Estrela)
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes heartbeat {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
