import { useState } from 'react';
import { AppState, Reward } from '@/hooks/useAppData';

interface Props {
  state: AppState;
  onBack: () => void;
  onPurchase: (reward: Reward) => void;
}

export default function RewardStore({ state, onBack, onPurchase }: Props) {
  const [pendingReward, setPendingReward] = useState<Reward | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const tryBuy = (reward: Reward) => {
    if (state.stars >= reward.cost) {
      setPendingReward(reward);
    } else {
      setErrorMsg(`Faltam ${reward.cost - state.stars} estrelas!`);
      setTimeout(() => setErrorMsg(''), 2000);
    }
  };

  const confirmPurchase = () => {
    if (pendingReward) {
      onPurchase(pendingReward);
      setPendingReward(null);
      setShowSuccess(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-yellow-400 p-6 shadow-md flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3 text-white">
          <button onClick={onBack} className="p-2 bg-yellow-500 rounded-full hover:bg-yellow-600 transition shadow-sm">
            <i className="fa-solid fa-arrow-left text-lg"></i>
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Lojinha</h1>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/10 px-4 py-2 rounded-full border border-slate-900/10">
          <i className="fa-solid fa-star text-white text-xl drop-shadow-sm"></i>
          <span className="text-2xl font-bold text-slate-900">{state.stars}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="bg-yellow-100 p-4 rounded-2xl border border-yellow-200 mb-6 flex items-start gap-3">
          <i className="fa-solid fa-circle-info text-yellow-600 mt-1"></i>
          <p className="text-yellow-800 text-sm">Toque nos prêmios para comprar!</p>
        </div>

        {state.rewards.length === 0 ? (
          <div className="text-center p-8 text-slate-400">
            <i className="fa-solid fa-store-slash text-4xl mb-2"></i>
            <p>A loja está vazia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {state.rewards.map((reward) => {
              const canAfford = state.stars >= reward.cost;
              return (
                <div
                  key={reward.id}
                  onClick={() => tryBuy(reward)}
                  className={`relative bg-white p-4 rounded-3xl shadow-sm flex flex-col items-center gap-3 text-center transition-all duration-200 active:scale-95 cursor-pointer ${
                    canAfford
                      ? 'border-2 border-transparent hover:border-green-400 hover:shadow-lg'
                      : 'opacity-70 grayscale border-2 border-transparent'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-1 ${
                      canAfford ? 'bg-indigo-100 text-indigo-500' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <i className={`fa-solid ${reward.icon}`}></i>
                  </div>
                  <h3 className="font-bold text-slate-700 leading-tight text-sm h-10 flex items-center justify-center overflow-hidden line-clamp-2">
                    {reward.title}
                  </h3>
                  <div
                    className={`px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${
                      canAfford ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <span>{reward.cost}</span> <i className="fa-solid fa-star text-xs"></i>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Purchase Confirm Modal */}
      {pendingReward && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white w-80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-bounce-in">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-500 text-4xl">
              <i className={`fa-solid ${pendingReward.icon}`}></i>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Comprar este prêmio?</h2>
            <p className="text-lg text-slate-600 font-medium mb-1">{pendingReward.title}</p>
            <div className="bg-yellow-50 text-yellow-700 px-4 py-1 rounded-full font-bold text-sm mb-6 border border-yellow-200">
              Custa {pendingReward.cost} <i className="fa-solid fa-star text-xs"></i>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setPendingReward(null)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPurchase}
                className="flex-1 py-3 rounded-xl font-bold bg-green-500 text-white shadow-lg hover:bg-green-600 transition"
              >
                Sim, Quero!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl text-center shadow-2xl w-80 border-4 border-green-400 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400"></div>
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
              <i className="fa-solid fa-check text-green-500 text-5xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Comprado!</h2>
            <p className="text-slate-500 mb-6">Mostre esta tela para um adulto.</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="bg-green-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-green-600 transition w-full"
            >
              Usar Agora
            </button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMsg && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-xl font-bold z-50 flex items-center gap-2 whitespace-nowrap">
          <i className="fa-solid fa-circle-xmark"></i>
          <span>{errorMsg}</span>
        </div>
      )}

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
      `}</style>
    </div>
  );
}
