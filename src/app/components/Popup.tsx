import React from 'react';

interface Props {
  title: string;
  message: string;
  onRestart: () => void;
  buttonText?: string;
}

export const Popup: React.FC<Props> = ({ title, message, onRestart, buttonText = "Restart Game" }) => {
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center animate-fade-in z-50">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-lg shadow-2xl text-center max-w-md w-full">
        <h2 className="text-4xl font-bold mb-4 text-white">{title}</h2>
        <p className="text-lg mb-8 text-slate-300">{message}</p>
        <button
          onClick={onRestart}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-500 transition-colors w-full"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};
