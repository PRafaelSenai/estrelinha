import { useState } from 'react';
import { Task } from '@/hooks/useAppData';

interface Props {
  task: Task | null;
  onSave: (task: Task) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const ICONS = [
  'fa-mug-hot', 'fa-utensils', 'fa-burger', 'fa-apple-whole',
  'fa-ice-cream', 'fa-candy-cane', 'fa-pizza-slice',
  'fa-school', 'fa-book', 'fa-pencil', 'fa-laptop',
  'fa-tv', 'fa-gamepad', 'fa-puzzle-piece', 'fa-music',
  'fa-bed', 'fa-bath', 'fa-toilet', 'fa-shirt',
  'fa-person-swimming', 'fa-futbol', 'fa-bicycle', 'fa-person-running',
  'fa-user-doctor', 'fa-tooth', 'fa-brain', 'fa-pills',
  'fa-car', 'fa-bus', 'fa-cart-shopping', 'fa-tree',
  'fa-gift', 'fa-trophy', 'fa-ticket', 'fa-plane'
];

export default function TaskModal({ task, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(task?.title || '');
  const [duration, setDuration] = useState(task?.duration || 30);
  const [icon, setIcon] = useState(task?.icon || 'fa-star');
  const [visibleToChild, setVisibleToChild] = useState(task?.visible_to_child ?? true);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Digite um nome!');
      return;
    }
    onSave({
      id: task?.id || 0,
      title: title.trim(),
      duration,
      icon,
      completed: task?.completed || false,
      visible_to_child: visibleToChild
    });
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-full sm:w-11/12 sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl h-[85vh] sm:h-auto flex flex-col animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">{task ? 'Editar' : 'Nova'} Atividade</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-1">Nome</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 mb-1">Duração (min)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="120"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <div className="w-16 bg-slate-100 border rounded-xl p-2 text-center font-bold text-slate-700">
                {duration}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 mb-1">Visível para Criança</label>
            <button
              onClick={() => setVisibleToChild(!visibleToChild)}
              className={`w-full p-3 rounded-xl border flex items-center justify-between ${
                visibleToChild 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <span>{visibleToChild ? 'Sim, mostrar' : 'Não, ocultar'}</span>
              <i className={`fa-solid ${visibleToChild ? 'fa-eye' : 'fa-eye-slash'}`}></i>
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 mb-2">Ícone</label>
            <div className="grid grid-cols-5 gap-2">
              {ICONS.map((ic) => (
                <div
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition ${
                    icon === ic
                      ? 'text-white bg-blue-500 scale-110 shadow-md'
                      : 'text-slate-400 bg-slate-50 hover:bg-blue-100'
                  }`}
                >
                  <i className={`fa-solid ${ic} text-lg`}></i>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
          {onDelete && (
            <button
              onClick={() => confirm('Apagar atividade?') && onDelete()}
              className="px-4 py-3 bg-red-50 text-red-500 rounded-xl font-bold"
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          )}
          <button onClick={handleSave} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg">
            Salvar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
