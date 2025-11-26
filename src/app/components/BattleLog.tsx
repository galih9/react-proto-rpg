import React from 'react';
import type { LogEntry } from '../types';

interface Props {
  logs: LogEntry[];
}

export const BattleLog: React.FC<Props> = ({ logs }) => {
  return (
    <div className="w-full max-w-4xl bg-black font-mono text-sm p-4 h-48 overflow-y-auto border border-gray-700 rounded shadow-inner">
      {logs.length === 0 && (
        <span className="text-gray-500 italic">Waiting for battle actions...</span>
      )}
      
      {logs.map((log) => (
        <div key={log.id} className="mb-1 border-b border-gray-900 pb-1 last:border-0 animate-fade-in">
          <span className="text-green-500 mr-2 font-bold">
            [{new Date(log.id).toLocaleTimeString([], { hour12: false })}]
          </span>
          <span className="text-gray-200">{log.message}</span>
        </div>
      ))}
    </div>
  );
};