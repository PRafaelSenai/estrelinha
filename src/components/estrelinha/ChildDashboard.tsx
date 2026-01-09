import { AppState, Task } from '@/hooks/useAppData';

interface Props {
  state: AppState;
  onStartTask: (id: number) => void;
  onChangeView: (view: 'child' | 'active-task' | 'store' | 'parent' | 'feelings') => void;
  onClearFeeling: () => void;
}

const THEME_STYLES: Record<string, {
  accent: string;
  border: string;
  iconBg: string;
  iconText: string;
  playBtn: string;
  playIcon: string;
}> = {
  'theme-blue': {
    accent: 'blue',
    border: 'border-blue-500',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-500',
    playBtn: 'bg-blue-100',
    playIcon: 'text-blue-500'
  },
  'theme-green': {
    accent: 'green',
    border: 'border-green-500',
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    playBtn: 'bg-green-100',
    playIcon: 'text-green-600'
  },
  'theme-purple': {
    accent: 'purple',
    border: 'border-purple-500',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    playBtn: 'bg-purple-100',
    playIcon: 'text-purple-600'
  },
  'theme-dark': {
    accent: 'slate',
    border: 'border-slate-800',
    iconBg: 'bg-slate-200',
    iconText: 'text-slate-800',
    playBtn: 'bg-slate-800',
    playIcon: 'text-white'
  }
};

const FEELING_EMOJI: Record<string, string> = {
  'Feliz': '😄',
  'Tranquilo': '🙂',
  'Cansado': '😫',
  'Bravo': '😡',
  'Triste': '😢'
};

function formatDuration(m: number): string {
  return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}` : `${m} min`;
}

export default function ChildDashboard({ state, onStartTask, onChangeView, onClearFeeling }: Props) {
  const greeting = state.childName ? `Olá, ${state.childName}!` : 'Estrelinha';
  const visibleTasks = state.routine.filter(t => t.visible_to_child);
  const theme = THEME_STYLES[state.theme] || THEME_STYLES['theme-blue'];

  return (
    <>
      <header className="flex justify-between items-center p-6 bg-white/80 backdrop-blur-md shadow-sm z-10 sticky top-0">
        <div
          onClick={() => onChangeView('store')}
          className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full shadow-sm border border-yellow-200 cursor-pointer active:scale-95 transition hover:bg-yellow-100"
        >
          <i className="fa-solid fa-star text-yellow-400 text-2xl drop-shadow-sm animate-pulse"></i>
          <span className="text-2xl font-bold text-yellow-600">{state.stars}</span>
          <span className="text-xs text-yellow-500 font-medium ml-1">LOJA</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onChangeView('feelings')}
            className="w-10 h-10 flex items-center justify-center bg-pink-100 text-pink-500 rounded-full hover:bg-pink-200 transition shadow-sm"
          >
            <i className="fa-solid fa-face-smile text-lg"></i>
          </button>
          <button
            onClick={() => onChangeView('parent')}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <i className="fa-solid fa-gear text-lg"></i>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        <div className="ml-2 mb-4">
          <h1 className="text-2xl font-bold text-slate-800">{greeting}</h1>
          <p className="text-slate-500 text-sm">Sua rotina divertida!</p>
        </div>

        {state.currentFeeling && (
          <div className="bg-white p-3 rounded-2xl shadow-sm flex items-center gap-3 mb-4 border-l-4 border-pink-300">
            <span className="text-2xl">{FEELING_EMOJI[state.currentFeeling] || '😐'}</span>
            <span className="text-slate-600 font-medium">
              Estou: <strong>{state.currentFeeling}</strong>
            </span>
            <button
              onClick={onClearFeeling}
              className="ml-auto text-slate-300 hover:text-red-400 w-8 h-8 flex items-center justify-center rounded-full"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        )}

        {visibleTasks.length === 0 ? (
          <div className="text-center p-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
            <i className="fa-solid fa-clipboard-list text-4xl mb-2"></i>
            <p>Peça para configurar sua rotina!</p>
          </div>
        ) : (
          visibleTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => !task.completed && onStartTask(task.id)}
              className={`relative p-4 rounded-3xl flex items-center gap-5 transition-all transform duration-300 ${task.completed
                ? 'bg-slate-100 opacity-60 grayscale cursor-default'
                : `bg-white shadow-md hover:scale-[1.02] hover:shadow-lg cursor-pointer border-l-8 ${theme.border}`
                }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${task.completed ? 'bg-slate-200 text-slate-400' : `${theme.iconBg} ${theme.iconText}`
                  }`}
              >
                <i className={`fa-solid ${task.icon}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-lg text-slate-800 truncate ${task.completed ? 'line-through' : ''}`}>
                  {task.title}
                </h3>
                <p className="text-slate-500 text-sm flex items-center gap-1">
                  <i className="fa-regular fa-clock text-xs"></i> {formatDuration(task.duration)}
                </p>
              </div>
              {task.completed ? (
                <i className="fa-solid fa-circle-check text-green-500 text-3xl"></i>
              ) : (
                <div className={`${theme.playBtn} w-10 h-10 rounded-full flex items-center justify-center ${theme.playIcon}`}>
                  <i className="fa-solid fa-play ml-1"></i>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
