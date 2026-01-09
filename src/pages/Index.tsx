import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppData, Task, Reward } from '@/hooks/useAppData';
import ChildDashboard from '@/components/estrelinha/ChildDashboard';
import ActiveTask from '@/components/estrelinha/ActiveTask';
import ActiveReward from '@/components/estrelinha/ActiveReward';
import RewardStore from '@/components/estrelinha/RewardStore';
import ParentDashboard from '@/components/estrelinha/ParentDashboard';
import FeelingsCheckin from '@/components/estrelinha/FeelingsCheckin';
import Overlay from '@/components/estrelinha/Overlays';

type View = 'child' | 'active-task' | 'store' | 'parent' | 'feelings' | 'active-reward';
type OverlayType = 'reward' | 'penalty' | 'encouragement' | null;

const THEME_CLASSES: Record<string, string> = {
  'theme-blue': 'bg-blue-50',
  'theme-green': 'bg-green-50',
  'theme-purple': 'bg-purple-50',
  'theme-dark': 'bg-slate-900'
};

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { state, updateState, loading: dataLoading } = useAppData();

  const [view, setView] = useState<View>('child');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeReward, setActiveReward] = useState<Reward | null>(null);
  const [overlay, setOverlay] = useState<OverlayType>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <i className="fa-solid fa-star text-yellow-400 text-5xl animate-pulse mb-4"></i>
          <p className="text-slate-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleStartTask = (id: number) => {
    const task = state.routine.find(t => t.id === id);
    if (task && !task.completed) {
      setActiveTask(task);
      setView('active-task');
    }
  };

  const handleFinishTask = (success: boolean) => {
    if (!activeTask) return;
    const updatedRoutine = state.routine.map(t =>
      t.id === activeTask.id ? { ...t, completed: true } : t
    );

    if (success) {
      updateState({
        routine: updatedRoutine,
        stars: state.stars + 1,
        history: [
          ...state.history,
          {
            id: crypto.randomUUID(),
            type: 'task_completed',
            title: activeTask.title,
            points: 1,
            timestamp: new Date().toISOString()
          }
        ]
      });
      setOverlay('reward');
    } else {
      if (state.stars === 1) {
        updateState({ routine: updatedRoutine, stars: 0 });
        setOverlay('encouragement');
      } else if (state.stars > 1) {
        updateState({ routine: updatedRoutine, stars: state.stars - 1 });
        setOverlay('penalty');
      } else {
        updateState({ routine: updatedRoutine });
        setOverlay('penalty');
      }
    }
    setActiveTask(null);
    setView('child');
  };

  const handlePurchase = (reward: Reward) => {
    if (state.stars >= reward.cost) {
      updateState({
        stars: state.stars - reward.cost,
        history: [
          ...state.history,
          {
            id: crypto.randomUUID(),
            type: 'reward_redeemed',
            title: reward.title,
            points: -reward.cost,
            timestamp: new Date().toISOString()
          }
        ]
      });
      setActiveReward(reward);
      setView('active-reward');
    }
  };

  const handleFinishReward = () => {
    setActiveReward(null);
    setView('child');
  };

  const handleSelectFeeling = (feeling: string) => {
    updateState({ currentFeeling: feeling });
    setView('child');
  };

  const bgClass = THEME_CLASSES[state.theme] || 'bg-blue-50';

  return (
    <div className={`w-full min-h-screen ${bgClass} transition-colors duration-500 flex items-center justify-center p-0 lg:p-8`}>
      <div className="w-full h-screen lg:h-[850px] max-w-7xl flex gap-8 relative overflow-hidden lg:rounded-3xl lg:shadow-2xl lg:bg-white/5 lg:backdrop-blur-sm lg:border lg:border-white/10">

        {/* Main Content Area */}
        <div className="flex-1 max-w-md mx-auto lg:max-w-none w-full h-full relative overflow-hidden bg-white/0 lg:bg-white/50 lg:rounded-2xl lg:shadow-inner flex flex-col">
          {view === 'child' && (
            <ChildDashboard
              state={state}
              onStartTask={handleStartTask}
              onChangeView={setView}
              onClearFeeling={() => updateState({ currentFeeling: null })}
            />
          )}

          {view === 'active-task' && activeTask && (
            <ActiveTask
              task={activeTask}
              onFinish={handleFinishTask}
              onBack={() => setView('child')}
              soundEnabled={state.soundEnabled}
            />
          )}

          {view === 'active-reward' && activeReward && (
            <ActiveReward
              reward={activeReward}
              onFinish={handleFinishReward}
              soundEnabled={state.soundEnabled}
            />
          )}

          {view === 'store' && (
            <RewardStore
              state={state}
              onBack={() => setView('child')}
              onPurchase={handlePurchase}
            />
          )}

          {view === 'parent' && (
            <ParentDashboard
              state={state}
              updateState={updateState}
              onBack={() => setView('child')}
            />
          )}

          {view === 'feelings' && (
            <FeelingsCheckin
              onSelect={handleSelectFeeling}
              onBack={() => setView('child')}
            />
          )}
        </div>

        {/* Desktop Side Panel (Optional - Visualization of Progress/Stars) */}
        <div className="hidden lg:flex w-80 flex-col gap-4">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="font-bold text-slate-700 mb-4">Minhas Estrelinhas</h3>
            <div className="flex items-center gap-3 text-4xl font-bold text-yellow-500">
              <i className="fa-solid fa-star animate-spin-slow"></i>
              <span>{state.stars}</span>
            </div>
            <p className="text-sm text-slate-400 mt-2">Continue assim!</p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 flex-1">
            <h3 className="font-bold text-slate-700 mb-4">Próximos Prêmios</h3>
            <div className="space-y-4">
              {state.rewards.slice(0, 3).map(r => (
                <div key={r.id} className="flex items-center gap-3 opacity-80">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500">
                    <i className={`fa-solid ${r.icon}`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700">{r.title}</p>
                    <p className="text-xs text-slate-500">{r.cost} estrelas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {overlay && <Overlay type={overlay} onClose={() => setOverlay(null)} />}
      </div>
    </div>
  );
}
