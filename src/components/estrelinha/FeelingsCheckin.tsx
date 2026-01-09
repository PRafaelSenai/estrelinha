interface Props {
  onSelect: (feeling: string) => void;
  onBack: () => void;
}

const FEELINGS = [
  { id: 'Feliz', icon: 'fa-face-laugh-beam', color: 'text-green-500', bg: 'bg-green-100' },
  { id: 'Tranquilo', icon: 'fa-face-smile', color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 'Cansado', icon: 'fa-face-tired', color: 'text-purple-500', bg: 'bg-purple-100' },
  { id: 'Bravo', icon: 'fa-face-angry', color: 'text-red-500', bg: 'bg-red-100' },
  { id: 'Triste', icon: 'fa-face-sad-tear', color: 'text-blue-300', bg: 'bg-blue-50' }
];

export default function FeelingsCheckin({ onSelect, onBack }: Props) {
  return (
    <div className="flex flex-col h-full bg-white p-6 relative">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition"
      >
        <i className="fa-solid fa-arrow-left text-slate-600"></i>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center pt-10">
        <h2 className="text-2xl font-bold text-slate-700 mb-8 text-center">Como você está?</h2>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {FEELINGS.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelect(f.id)}
              className={`p-4 rounded-2xl ${f.bg} flex flex-col items-center gap-3 transition transform hover:scale-105 active:scale-95`}
            >
              <i className={`fa-solid ${f.icon} text-4xl ${f.color}`}></i>
              <span className="font-bold text-slate-700">{f.id}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
