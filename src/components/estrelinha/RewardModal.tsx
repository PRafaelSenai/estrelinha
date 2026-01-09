import { useState } from 'react';
import { Reward } from '@/hooks/useAppData';

interface Props {
  reward: Reward | null;
  onSave: (reward: Reward) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const ICONS = [
  'fa-gift', 'fa-trophy', 'fa-ticket', 'fa-plane',
  'fa-tablet-screen-button', 'fa-tv', 'fa-gamepad', 'fa-ice-cream',
  'fa-candy-cane', 'fa-pizza-slice', 'fa-tree', 'fa-bicycle',
  'fa-futbol', 'fa-puzzle-piece', 'fa-music', 'fa-star'
];

export default function RewardModal({ reward, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(reward?.title || '');
  const [cost, setCost] = useState(reward?.cost || 5);
  const [duration, setDuration] = useState(reward?.duration || 0);
  const [icon, setIcon] = useState(reward?.icon || 'fa-gift');

  const handleSave = () => {
    if (!title.trim()) {
      alert('Digite um nome!');
      return;
    }
    onSave({
      id: reward?.id || 0,
      title: title.trim(),
      cost,
      duration,
      icon
    });
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-full sm:w-11/12 sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl h-[85vh] sm:h-auto flex flex-col animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">{reward ? 'Editar' : 'Novo'} Prêmio</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-1">Nome do Prêmio</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium outline-none"
              placeholder="Ex: Escolher Filme"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 mb-1">Preço (Estrelas)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="50"
                value={cost}
                onChange={(e) => setCost(parseInt(e.target.value))}
                className="flex-1 accent-yellow-400"
              />
              <div className="w-16 bg-yellow-50 border border-yellow-200 rounded-xl p-2 text-center font-bold text-yellow-700 flex items-center justify-center gap-1">
                <span>{cost}</span> <i className="fa-solid fa-star text-xs"></i>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 mb-1">Tempo de Uso (min)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <div className="w-16 bg-blue-50 border border-blue-200 rounded-xl p-2 text-center font-bold text-blue-700">
                {duration > 0 ? duration : '∞'}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">0 = Sem limite de tempo</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 mb-2">Ícone</label>
            <div className="grid grid-cols-5 gap-2">
              {ICONS.map((ic) => (
                <div
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition ${icon === ic
                    ? 'text-slate-900 bg-yellow-400 scale-110 shadow-md'
                    : 'text-slate-400 bg-slate-50 hover:bg-yellow-100'
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
              onClick={() => confirm('Apagar prêmio?') && onDelete()}
              className="px-4 py-3 bg-red-50 text-red-500 rounded-xl font-bold"
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          )}
          <button onClick={handleSave} className="flex-1 bg-yellow-400 text-slate-900 py-3 rounded-xl font-bold shadow-lg">
            Salvar Prêmio
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
