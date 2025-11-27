import React from 'react';

interface Props {
  title: string;
  message: string;
  onRestart: () => void;
  buttonText?: string;
  buttonColor?: string;
}

export const Popup: React.FC<Props> = ({
  title,
  message,
  onRestart,
  buttonText = "Restart Game",
  buttonColor = "bg-blue-500 hover:bg-blue-400"
}) => {
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center animate-fade-in z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-md w-full">
        <h2 className="text-4xl font-bold mb-4 text-gray-800">{title}</h2>
        <p className="text-lg mb-8 text-gray-600">{message}</p>
        <button
          onClick={onRestart}
          className={`${buttonColor} text-white px-8 py-3 rounded-lg font-bold transition-colors duration-200 w-full`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};
