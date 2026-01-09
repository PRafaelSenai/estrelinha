interface OverlayProps {
  type: 'reward' | 'penalty' | 'encouragement';
  onClose: () => void;
}

export default function Overlay({ type, onClose }: OverlayProps) {
  if (type === 'reward') {
    return (
      <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-white p-8 rounded-3xl text-center shadow-2xl w-80 border-4 border-yellow-300 animate-bounce-in">
          <i
            className="fa-solid fa-star text-yellow-400 text-7xl mb-4"
            style={{ filter: 'drop-shadow(0 0 10px gold)', animation: 'spin 3s linear infinite' }}
          ></i>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Muito Bem!</h2>
          <p className="text-slate-500 text-lg">+1 Estrelinha</p>
          <button
            onClick={onClose}
            className="mt-6 bg-yellow-400 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-yellow-500 transition w-full text-xl"
          >
            Legal!
          </button>
        </div>
        <style>{`
          @keyframes bounce-in {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
        `}</style>
      </div>
    );
  }

  if (type === 'penalty') {
    return (
      <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-white p-8 rounded-3xl text-center shadow-2xl w-80 border-4 border-red-300 animate-shake">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <i className="fa-solid fa-star text-slate-300 text-7xl"></i>
            <i className="fa-solid fa-slash text-red-500 text-7xl absolute inset-0 opacity-80"></i>
          </div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">Poxa vida...</h2>
          <p className="text-slate-600 font-bold text-lg mb-1">-1 Estrelinha</p>
          <p className="text-xs text-slate-400">Tarefa não realizada.</p>
          <button
            onClick={onClose}
            className="mt-6 bg-slate-400 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-slate-500 transition w-full"
          >
            Vou melhorar
          </button>
        </div>
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .animate-shake { animation: shake 0.4s ease-in-out; }
        `}</style>
      </div>
    );
  }

  if (type === 'encouragement') {
    return (
      <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-white p-8 rounded-3xl text-center shadow-2xl w-80 border-4 border-blue-300 animate-bounce-in">
          <div className="relative w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-hand-holding-heart text-blue-500 text-5xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Não desanime!</h2>
          <p className="text-slate-600 text-lg mb-4">Está tudo bem recomeçar.</p>
          <p className="text-sm text-slate-400 mb-6">
            Você consegue recuperar suas estrelinhas. Vamos tentar de novo?
          </p>
          <button
            onClick={onClose}
            className="bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-600 transition w-full"
          >
            Combinado!
          </button>
        </div>
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

  return null;
}
