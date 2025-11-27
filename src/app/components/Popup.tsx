import React from 'react';

interface Props {
  title: string;
  message: string;
  onRestart: () => void;
}

export const Popup: React.FC<Props> = ({ title, message, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center animate-fade-in">
      <div className="bg-white p-8 rounded-lg shadow-2xl text-center">
        <h2 className="text-4xl font-bold mb-4">{title}</h2>
        <p className="text-lg mb-8">{message}</p>
        <button
          onClick={onRestart}
          className="bg-blue-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-400"
        >
          Restart Game
        </button>
      </div>
    </div>
  );
};
