interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onEncyclopedia: () => void;
}

export function PauseMenu({ onResume, onRestart, onEncyclopedia }: PauseMenuProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col gap-4 w-80 text-center border-4 border-slate-200">
        <h2 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-widest">Paused</h2>

        <button
          onClick={onResume}
          className="bg-slate-800 text-white font-bold py-3 px-6 rounded hover:bg-slate-700 transition-colors shadow-lg"
        >
          RESUME
        </button>

        <button
          onClick={onEncyclopedia}
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded hover:bg-blue-700 transition-colors shadow-lg"
        >
          ENCYCLOPEDIA
        </button>

        <button
          onClick={onRestart}
          className="bg-red-500 text-white font-bold py-3 px-6 rounded hover:bg-red-600 transition-colors shadow-lg"
        >
          RESTART GAME
        </button>
      </div>
    </div>
  );
}
