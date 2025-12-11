interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
      <div className="bg-slate-800 text-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border border-slate-600">

        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
          <h2 className="text-2xl font-bold tracking-wider text-yellow-500">ABOUT</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center space-y-6">
            <p className="text-lg text-slate-300">
                This game application was built using the following technologies:
            </p>

            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                <div className="bg-slate-700 p-4 rounded-lg flex items-center justify-center gap-4 border border-slate-600">
                   <div className="w-10 h-10 flex items-center justify-center bg-blue-900 rounded-full text-blue-300 font-bold text-xl">R</div>
                   <div className="font-bold text-xl">React</div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg flex items-center justify-center gap-4 border border-slate-600">
                   <div className="w-10 h-10 flex items-center justify-center bg-cyan-900 rounded-full text-cyan-300 font-bold text-xl">T</div>
                   <div className="font-bold text-xl">TailwindCSS</div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg flex items-center justify-center gap-4 border border-slate-600">
                   <div className="w-10 h-10 flex items-center justify-center bg-orange-900 rounded-full text-orange-300 font-bold text-xl">D</div>
                   <div className="font-bold text-xl">React DnD</div>
                </div>
            </div>

            <p className="text-slate-400 text-sm mt-8">
                Enjoy the tactical battle experience!
            </p>
        </div>

      </div>
    </div>
  );
}
