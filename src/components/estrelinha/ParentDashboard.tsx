import { useState } from 'react';
import { AppState, Task, Reward } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import TaskModal from './TaskModal';
import RewardModal from './RewardModal';
import HistoryReports from './HistoryReports';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  onBack: () => void;
}

const THEMES = [
  { id: 'theme-blue', color: 'bg-blue-500' },
  { id: 'theme-green', color: 'bg-green-500' },
  { id: 'theme-purple', color: 'bg-purple-500' },
  { id: 'theme-dark', color: 'bg-slate-800' }
];

export default function ParentDashboard({ state, updateState, onBack }: Props) {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'config' | 'reports'>('config');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const adjustStars = (amt: number) => {
    const newStars = Math.max(0, state.stars + amt);
    updateState({
      stars: newStars,
      history: [
        ...state.history,
        {
          id: crypto.randomUUID(),
          type: 'manual_adjustment',
          title: amt > 0 ? 'Ajuste Manual (Bônus)' : 'Ajuste Manual (Penalidade)',
          points: amt,
          timestamp: new Date().toISOString()
        }
      ]
    });
  };

  const resetDay = () => {
    if (!confirm('Iniciar novo dia e limpar tarefas?')) return;
    const resetRoutine = state.routine.map(t => ({ ...t, completed: false }));
    updateState({ routine: resetRoutine, currentFeeling: null });
  };

  const openTaskModal = (task?: Task) => {
    setEditingTask(task || null);
    setShowTaskModal(true);
  };

  const saveTask = (task: Task) => {
    if (editingTask) {
      updateState({ routine: state.routine.map(t => t.id === task.id ? task : t) });
    } else {
      updateState({ routine: [...state.routine, { ...task, id: Date.now() }] });
    }
    setShowTaskModal(false);
  };

  const deleteTask = (id: number) => {
    updateState({ routine: state.routine.filter(t => t.id !== id) });
    setShowTaskModal(false);
  };

  const toggleTaskVisibility = (id: number) => {
    updateState({
      routine: state.routine.map(t =>
        t.id === id ? { ...t, visible_to_child: !t.visible_to_child } : t
      )
    });
  };

  const openRewardModal = (reward?: Reward) => {
    setEditingReward(reward || null);
    setShowRewardModal(true);
  };

  const saveReward = (reward: Reward) => {
    if (editingReward) {
      updateState({ rewards: state.rewards.map(r => r.id === reward.id ? reward : r) });
    } else {
      updateState({ rewards: [...state.rewards, { ...reward, id: Date.now() }] });
    }
    setShowRewardModal(false);
  };

  const deleteReward = (id: number) => {
    updateState({ rewards: state.rewards.filter(r => r.id !== id) });
    setShowRewardModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-white p-4 shadow-sm flex items-center gap-3 border-b border-slate-100 sticky top-0 z-20">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-xl font-bold text-slate-800 flex-1">Área dos Pais</h1>
        <button onClick={signOut} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition" title="Sair">
          <i className="fa-solid fa-right-from-bracket text-lg"></i>
        </button>
      </header>

      {/* Tabs */}
      <div className="flex p-4 gap-4">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 p-3 rounded-xl font-bold text-sm transition ${activeTab === 'config' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
        >
          <i className="fa-solid fa-sliders mr-2"></i> Configurações
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 p-3 rounded-xl font-bold text-sm transition ${activeTab === 'reports' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
        >
          <i className="fa-solid fa-chart-pie mr-2"></i> Relatórios
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-20">
        {activeTab === 'reports' ? (
          <HistoryReports state={state} />
        ) : (
          <div className="space-y-8">
            {/* User Info */}
            <div className="bg-blue-50 p-3 rounded-xl flex items-center gap-3 border border-blue-100">
              <i className="fa-solid fa-user-circle text-blue-400 text-2xl"></i>
              <span className="text-sm text-blue-700 truncate">{user?.email}</span>
            </div>

            {/* Star Management */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">
                Gestão de Comportamento
              </h2>
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => adjustStars(-1)}
                  className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center text-3xl shadow-sm active:scale-95 transition hover:bg-red-100"
                >
                  <i className="fa-solid fa-minus"></i>
                </button>
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-bold text-yellow-500 flex items-center gap-2">
                    {state.stars} <i className="fa-solid fa-star text-3xl"></i>
                  </div>
                  <span className="text-xs text-slate-400 mt-1">Saldo Atual</span>
                </div>
                <button
                  onClick={() => adjustStars(1)}
                  className="w-16 h-16 rounded-2xl bg-green-50 text-green-500 border border-green-100 flex items-center justify-center text-3xl shadow-sm active:scale-95 transition hover:bg-green-100"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </section>

            {/* Child Name */}
            <section>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Criança</label>
              <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                <input
                  type="text"
                  value={state.childName}
                  onChange={(e) => updateState({ childName: e.target.value })}
                  placeholder="Nome da Criança"
                  className="w-full bg-transparent p-2 outline-none text-slate-700 font-bold"
                />
              </div>
            </section>

            {/* Theme */}
            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Tema</h2>
              <div className="grid grid-cols-4 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateState({ theme: t.id })}
                    className={`h-12 rounded-xl border-2 ${state.theme === t.id ? 'border-slate-800 scale-95' : 'border-transparent'
                      } ${t.color} shadow-sm transition-transform`}
                  />
                ))}
              </div>
            </section>

            {/* Routine */}
            <section>
              <div className="flex justify-between items-end mb-3 ml-1">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rotina Diária</h2>
                <button onClick={resetDay} className="text-xs text-red-400 hover:text-red-600 font-medium">
                  Resetar Dia
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
                {state.routine.map((task) => (
                  <div key={task.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition">
                    <button
                      onClick={() => toggleTaskVisibility(task.id)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${task.visible_to_child
                        ? 'bg-green-100 text-green-600'
                        : 'bg-slate-100 text-slate-400'
                        }`}
                      title={task.visible_to_child ? 'Visível para criança' : 'Oculto da criança'}
                    >
                      <i className={`fa-solid ${task.visible_to_child ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                    </button>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <i className={`fa-solid ${task.icon}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-700 truncate">{task.title}</div>
                      <div className="text-xs text-slate-400">{task.duration} min</div>
                    </div>
                    <button onClick={() => openTaskModal(task)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg">
                      <i className="fa-solid fa-pen"></i>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => openTaskModal()}
                  className="w-full p-4 text-center text-blue-500 font-bold hover:bg-blue-50 transition rounded-b-2xl"
                >
                  <i className="fa-solid fa-plus-circle"></i> Adicionar
                </button>
              </div>
            </section>

            {/* Rewards */}
            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Loja de Recompensas</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
                {state.rewards.map((reward) => (
                  <div key={reward.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition">
                    <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600">
                      <i className={`fa-solid ${reward.icon}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-700 truncate">{reward.title}</div>
                      <div className="text-xs text-yellow-600 font-bold flex items-center gap-1">
                        {reward.cost} <i className="fa-solid fa-star text-[10px]"></i>
                      </div>
                    </div>
                    <button onClick={() => openRewardModal(reward)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg">
                      <i className="fa-solid fa-pen"></i>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => openRewardModal()}
                  className="w-full p-4 text-center text-yellow-600 font-bold hover:bg-yellow-50 transition rounded-b-2xl"
                >
                  <i className="fa-solid fa-plus-circle"></i> Adicionar Prêmio
                </button>
              </div>
            </section>
          </div>
        )}
      </div>

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onSave={saveTask}
          onDelete={editingTask ? () => deleteTask(editingTask.id) : undefined}
          onClose={() => setShowTaskModal(false)}
        />
      )}

      {showRewardModal && (
        <RewardModal
          reward={editingReward}
          onSave={saveReward}
          onDelete={editingReward ? () => deleteReward(editingReward.id) : undefined}
          onClose={() => setShowRewardModal(false)}
        />
      )}
    </div>
  );
}
